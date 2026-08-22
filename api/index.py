import os
import sys

# Project root
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Add backend to Python import path
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Import FastAPI application
from main import app as fastapi_app


class StripAPIPrefixMiddleware:
    """
    Vercel sends /api/... to this function.
    FastAPI itself defines routes as /health, /admin/..., etc.

    Therefore:
        /api/health
    becomes:
        /health
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):

        if scope["type"] == "http":

            path = scope.get("path", "")

            if path == "/api":
                scope["path"] = "/"
                scope["raw_path"] = b"/"

            elif path.startswith("/api/"):

                new_path = path[4:]

                scope["path"] = new_path
                scope["raw_path"] = new_path.encode("utf-8")

        await self.app(scope, receive, send)


app = StripAPIPrefixMiddleware(fastapi_app)
