import os
import sys

# Add backend directory to Python path
backend_dir = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "backend"
)

sys.path.insert(0, backend_dir)

# Import the existing FastAPI application
from main import app


# Vercel exposes the function under /api/*.
# The existing FastAPI application uses routes without /api.
# Strip /api before passing the request to FastAPI.
class StripAPIPrefixMiddleware:
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


app = StripAPIPrefixMiddleware(app)
