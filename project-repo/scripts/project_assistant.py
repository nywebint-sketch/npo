#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "data" / "projects.json"
PROJECTS_DIR = ROOT / "projects"

BLOCK_KEYS = {
    "задача": "Задачи",
    "task": "Задачи",
    "статус": "Статус",
    "status": "Статус",
    "риск": "Риски",
    "risk": "Риски",
    "дедлайн": "Дедлайны",
    "deadline": "Дедлайны",
    "идея": "Идеи",
    "idea": "Идеи",
}


def load_config() -> List[Dict[str, object]]:
    raw = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    return raw.get("projects", [])


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip())


def detect_project(text: str, projects: List[Dict[str, object]], explicit: str | None) -> Tuple[Dict[str, object], str]:
    if explicit:
        for p in projects:
            if explicit.lower() in {str(p["id"]).lower(), str(p["name"]).lower()}:
                return p, "manual"

    m = re.search(r"(?:#project|проект)\s*[:=]\s*([^\n,;.]+)", text, re.IGNORECASE)
    if m:
        needle = m.group(1).strip().lower()
        for p in projects:
            if needle in str(p["name"]).lower() or needle == str(p["id"]).lower():
                return p, "tag"

    lowered = text.lower()
    best = None
    best_score = 0
    for p in projects:
        aliases = p.get("aliases", [])
        score = 0
        for alias in aliases:
            a = str(alias).lower()
            score += len(re.findall(rf"\b{re.escape(a)}\b", lowered))
            if a in lowered:
                score += 1
        if score > best_score:
            best_score = score
            best = p

    if best and best_score > 0:
        return best, "keyword"

    # fallback to first configured project
    return projects[0], "fallback"


def detect_block(text: str, default_block: str) -> str:
    lowered = text.lower()
    earliest_pos = None
    chosen = None

    for key, block in BLOCK_KEYS.items():
        m = re.search(rf"\b{re.escape(key)}\b", lowered)
        if not m:
            continue
        pos = m.start()
        if earliest_pos is None or pos < earliest_pos:
            earliest_pos = pos
            chosen = block

    if chosen:
        return chosen
    return default_block


def append_note(project: Dict[str, object], block: str, text: str, source: str) -> Path:
    project_id = str(project["id"])
    project_name = str(project["name"])
    folder = PROJECTS_DIR / project_id
    folder.mkdir(parents=True, exist_ok=True)

    log_path = folder / "log.md"
    if not log_path.exists():
        log_path.write_text(
            f"# {project_name}\n\n"
            "## Блоки\n"
            "- Статус\n"
            "- Задачи\n"
            "- Риски\n"
            "- Дедлайны\n"
            "- Идеи\n"
            "- Операционка\n\n"
            "## Лента\n",
            encoding="utf-8",
        )

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    normalized = clean_text(text)

    with log_path.open("a", encoding="utf-8") as f:
        f.write(f"\n### {now} | {block}\n")
        f.write(f"- source: `{source}`\n")
        f.write(f"- note: {normalized}\n")

    return log_path


def read_input(note: str | None) -> str:
    if note:
        return note
    print("Вставьте текст. Завершите Ctrl+D:")
    try:
        import sys

        return sys.stdin.read()
    except KeyboardInterrupt:
        return ""


def main() -> None:
    parser = argparse.ArgumentParser(description="Разложить заметку по проектному блоку")
    parser.add_argument("note", nargs="?", help="Текст заметки")
    parser.add_argument("--project", help="ID или имя проекта")
    args = parser.parse_args()

    text = read_input(args.note)
    if not text or not text.strip():
        raise SystemExit("Пустой ввод")

    projects = load_config()
    if not projects:
        raise SystemExit("В data/projects.json нет проектов")

    project, source = detect_project(text, projects, args.project)
    block = detect_block(text, str(project.get("default_block", "Статус")))
    path = append_note(project, block, text, source)

    print(f"project={project['name']}")
    print(f"block={block}")
    print(f"source={source}")
    print(f"written={path}")


if __name__ == "__main__":
    main()
