import os
import sys
from pathlib import Path


def _resolve_backend_dir() -> Path:
    current = Path(__file__).resolve().parent
    for candidate in (current, *current.parents):
        backend_dir = candidate / "backend"
        if backend_dir.exists():
            return backend_dir
        if candidate.parent == candidate:
            break
    return current.parent / "backend"


BACKEND_DIR = _resolve_backend_dir()
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main import app  # noqa: E402
