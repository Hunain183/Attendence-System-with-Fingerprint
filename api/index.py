import sys
import os

# Add backend directory to Python path
backend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend")
sys.path.insert(0, backend_dir)

# Import the existing FastAPI application
from main import app

# Vercel uses this ASGI application
