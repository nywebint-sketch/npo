#!/usr/bin/env python3
"""Export Figma-ready PNG layouts from local index.html using Safari WebDriver.

Requirements:
- Safari -> Settings -> Advanced -> Show features for web developers
- Developer menu -> Allow Remote Automation (ON)

Usage:
  python3 export_figma_png.py
"""

from __future__ import annotations

import base64
import json
import os
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

PORT = int(os.environ.get("SAFARI_DRIVER_PORT", "5557"))
ROOT = Path(__file__).resolve().parents[1]
INDEX_FILE = ROOT / "index.html"
OUT_DIR = ROOT / "figma-export"


def _request(method: str, path: str, payload: dict | None = None, timeout: int = 30) -> dict:
    data = None
    headers = {"Content-Type": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"http://127.0.0.1:{PORT}{path}", data=data, headers=headers, method=method
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return json.loads(res.read().decode("utf-8"))


def _create_session() -> str:
    payload = {"capabilities": {"alwaysMatch": {"browserName": "safari"}}}
    try:
        out = _request("POST", "/session", payload, timeout=20)
    except urllib.error.HTTPError as err:
        body = err.read().decode("utf-8", errors="replace")
        if "Allow remote automation" in body:
            raise RuntimeError(
                "Safari remote automation disabled. Enable:\n"
                "Safari -> Settings -> Advanced -> Show features for web developers\n"
                "Developer -> Allow Remote Automation"
            ) from err
        raise RuntimeError(f"Failed to create Safari session: HTTP {err.code} {body}") from err
    return out["value"]["sessionId"] if "sessionId" in out.get("value", {}) else out.get("sessionId")


def _set_window_rect(session_id: str, width: int, height: int) -> None:
    _request(
        "POST",
        f"/session/{session_id}/window/rect",
        {"x": 20, "y": 20, "width": width, "height": height},
    )


def _navigate(session_id: str, url: str) -> None:
    _request("POST", f"/session/{session_id}/url", {"url": url})


def _execute(session_id: str, script: str, args: list | None = None) -> dict:
    return _request(
        "POST",
        f"/session/{session_id}/execute/sync",
        {"script": script, "args": args or []},
    )


def _save_screenshot(session_id: str, out_file: Path) -> None:
    out = _request("GET", f"/session/{session_id}/screenshot")
    png_b64 = out.get("value", "")
    out_file.write_bytes(base64.b64decode(png_b64))


def _capture(session_id: str, name: str, width: int, min_height: int) -> None:
    _set_window_rect(session_id, width, min_height)
    _navigate(session_id, INDEX_FILE.resolve().as_uri())
    time.sleep(2.2)

    size = _execute(
        session_id,
        "return {w: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), "
        "h: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)};",
    )["value"]

    # Increase viewport to fit full page for a single screenshot.
    full_h = int(max(min_height, size.get("h", min_height)) + 32)
    _set_window_rect(session_id, width, full_h)
    time.sleep(0.8)

    out_file = OUT_DIR / f"{name}.png"
    _save_screenshot(session_id, out_file)
    print(f"saved: {out_file}")


def main() -> None:
    if not INDEX_FILE.exists():
        raise SystemExit(f"Missing file: {INDEX_FILE}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    proc = subprocess.Popen(["safaridriver", "-p", str(PORT)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.2)

    session_id = ""
    try:
        session_id = _create_session()
        _capture(session_id, "npo-desktop-1440", 1440, 2000)
        _capture(session_id, "npo-mobile-390", 390, 1800)
        print("done")
    finally:
        if session_id:
            try:
                _request("DELETE", f"/session/{session_id}")
            except Exception:
                pass
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except Exception:
            proc.kill()


if __name__ == "__main__":
    main()
