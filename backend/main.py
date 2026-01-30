"""
Fingerprint Attendance Management System
FastAPI Backend Application

This system provides:
- Employee management with fingerprint enrollment
- Attendance tracking via fingerprint devices
- JWT authentication for admin routes
- API key authentication for device routes
"""
import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import init_db
from routers import (
    auth_router,
    admin_users_router,
    employees_router,
    attendance_admin_router,
    attendance_device_router,
    manual_attendance_router
)

# Determine base directory (works for both dev and compiled exe)
if getattr(sys, 'frozen', False):
    # Running as compiled exe - use PyInstaller's temp folder
    BASE_DIR = sys._MEIPASS
else:
    # Running as script
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

STATIC_DIR = os.path.join(BASE_DIR, "static")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Initializes database on startup.
    """
    # Startup: Initialize database tables
    print("🚀 Starting Fingerprint Attendance System...")
    print(f"📂 Base directory: {BASE_DIR}")
    print(f"📂 Static directory: {STATIC_DIR}")
    print(f"📂 Static files exist: {os.path.exists(STATIC_DIR)}")
    if os.path.exists(STATIC_DIR):
        print(f"📂 Static files found: {os.listdir(STATIC_DIR)[:5]}")
    init_db()
    print("✅ Database initialized successfully")
    
    yield
    
    # Shutdown
    print("👋 Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Fingerprint Attendance Management System",
    description="""
    A comprehensive attendance management system using fingerprint authentication.
    
    ## Features
    - **Employee Management**: Create, update, and manage employee records
    - **Fingerprint Enrollment**: Securely store encrypted fingerprint templates
    - **Attendance Tracking**: Mark attendance via fingerprint scans
    - **Reporting**: View attendance records and summaries
    
    ## Authentication
    - Admin routes require JWT Bearer token (get via POST /admin/login)
    - Device routes require API key in X-API-Key header
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(admin_users_router)
app.include_router(manual_attendance_router)
app.include_router(employees_router)
app.include_router(attendance_admin_router)
app.include_router(attendance_device_router)

# Serve static frontend files if they exist (for compiled exe)
if os.path.exists(STATIC_DIR):
    # Mount static assets
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")
    
    @app.get("/", tags=["Frontend"])
    async def serve_index():
        """Serve the frontend index.html."""
        index_path = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"status": "healthy", "message": "Fingerprint Attendance Management System API"}
    
    @app.get("/{full_path:path}", tags=["Frontend"], include_in_schema=False)
    async def serve_frontend(full_path: str):
        """Serve the frontend application for SPA routing."""
        # Try to serve the exact file from static directory
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Fall back to index.html for SPA routing
        index_path = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        
        return {"error": "Not found"}

else:
    @app.get("/", tags=["Health"])
    async def root():
        """Root endpoint - API health check."""
        return {
            "status": "healthy",
            "message": "Fingerprint Attendance Management System API",
            "version": "1.0.0",
            "docs": "/docs"
        }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
