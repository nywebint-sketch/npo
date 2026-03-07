---
name: project-context-router
description: Structure producer notes across multiple advertising projects, route each incoming text to the correct project, and normalize into consistent blocks (status, tasks, deadlines, risks, decisions, assets). Use when user sends raw updates, voice-note transcripts, meeting dumps, or mixed notes and wants clean project context.
---

# Project Context Router

Use this workflow for every incoming note.

## 1. Detect Project

Apply this priority:
1. Explicit project marker in text (`проект: ...`, `#project: ...`).
2. Exact project name match.
3. Alias or keyword match.
4. If ambiguous, choose `INBOX` and mark `needs-triage`.

## 2. Split into Atomic Items

Break text into short atomic statements.
One statement must contain one fact/action/risk/decision.

## 3. Route into Blocks

Route each statement into exactly one block:
- `Статус`: current progress and outcomes.
- `Задачи`: actionable tasks with owner if present.
- `Дедлайны`: dates and time constraints.
- `Риски`: blockers, dependencies, uncertainty.
- `Решения`: approved choices and agreements.
- `Материалы`: links/files/references to assets.
- `Вопросы`: unresolved questions.

If one statement mixes multiple meanings, split it first.

## 4. Normalize Wording

Convert to concise operational style:
- start tasks with a verb;
- preserve concrete dates;
- keep names/brands/files unchanged;
- remove filler and duplicates.

## 5. Output Format

Return structured result in this exact shape:

```markdown
## <PROJECT_NAME>

### Статус
- ...

### Задачи
- [ ] ...

### Дедлайны
- ...

### Риски
- ...

### Решения
- ...

### Материалы
- ...

### Вопросы
- ...
```

Skip empty sections.

## 6. Multi-Project Input

If note contains multiple projects, output separate project sections.
Never merge different projects into one section.

## 7. Ambiguity Rule

If project cannot be confidently identified, output:

```markdown
## INBOX (needs-triage)
```

Then keep the same block structure.

## 8. Optional Script Mode

If running inside `/Users/nikita/Documents/New project/project-repo`, you can call:
`python3 scripts/project_assistant.py "<raw text>"`
Then append or review the generated project log at `projects/<project_id>/log.md`.

For block definitions and examples, read `references/block-examples.md`.
