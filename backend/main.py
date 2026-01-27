"""
Fingerprint Attendance Management System
FastAPI Backend Application

This system provides:
- Employee management with fingerprint enrollment
- Attendance tracking via fingerprint devices
- JWT authentication for admin routes
- API key authentication for device routes
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import (
    auth_router,
    admin_users_router,
    employees_router,
    attendance_admin_router,
    attendance_device_router
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Initializes database on startup.
    """
    # Startup: Initialize database tables
    print("🚀 Starting Fingerprint Attendance System...")
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
app.include_router(employees_router)
app.include_router(attendance_admin_router)
app.include_router(attendance_device_router)


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
