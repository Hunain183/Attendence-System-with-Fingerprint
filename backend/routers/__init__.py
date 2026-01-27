"""API Routers."""
from routers.auth import router as auth_router
from routers.employees import router as employees_router
from routers.attendance import admin_router as attendance_admin_router
from routers.attendance import device_router as attendance_device_router
from routers.admin_users import router as admin_users_router

__all__ = [
    "auth_router",
    "employees_router", 
    "attendance_admin_router",
    "attendance_device_router",
    "admin_users_router",
]
