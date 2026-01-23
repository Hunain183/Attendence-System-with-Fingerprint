"""Pydantic schemas for request/response validation."""
from schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListResponse,
    EmployeeMinimal,
    FingerprintEnroll
)
from schemas.attendance import (
    AttendanceMark,
    AttendanceResponse,
    AttendanceWithEmployee,
    AttendanceListResponse,
    AttendanceMarkResponse,
    DailyAttendanceSummary
)
from schemas.auth import LoginRequest, LoginResponse, TokenData

__all__ = [
    # Employee schemas
    "EmployeeCreate",
    "EmployeeUpdate", 
    "EmployeeResponse",
    "EmployeeListResponse",
    "EmployeeMinimal",
    "FingerprintEnroll",
    # Attendance schemas
    "AttendanceMark",
    "AttendanceResponse",
    "AttendanceWithEmployee",
    "AttendanceListResponse",
    "AttendanceMarkResponse",
    "DailyAttendanceSummary",
    # Auth schemas
    "LoginRequest",
    "LoginResponse",
    "TokenData"
]
