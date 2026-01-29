"""
Pydantic schemas for Attendance.
Handles request/response validation.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date, time, datetime

from schemas.employee import EmployeeMinimal


# ==================== Request Schemas ====================

class AttendanceMark(BaseModel):
    """Schema for marking attendance via device."""
    fingerprint_template: str = Field(..., min_length=1, description="Fingerprint template from device")
    device_id: str = Field(..., min_length=1, max_length=100, description="Device identifier")


class ManualAttendanceMark(BaseModel):
    """Schema for manually marking attendance by admin."""
    employee_no: str = Field(..., min_length=1, max_length=50, description="Employee number")
    attendance_date: date = Field(..., description="Date to mark attendance for")
    time_in: Optional[time] = Field(None, description="Time in")
    time_out: Optional[time] = Field(None, description="Time out")


# ==================== Response Schemas ====================

class AttendanceResponse(BaseModel):
    """Schema for attendance record response."""
    id: int
    employee_no: str
    attendance_date: date
    time_in: Optional[time] = None
    time_out: Optional[time] = None
    total_work_minutes: Optional[int] = 0
    overtime: bool = False
    overtime_minutes: Optional[int] = 0
    device_id: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AttendanceWithEmployee(BaseModel):
    """Schema for attendance with employee details."""
    id: int
    employee_no: str
    employee_name: str
    department: Optional[str] = None
    designation: Optional[str] = None
    attendance_date: date
    time_in: Optional[time] = None
    time_out: Optional[time] = None
    total_work_minutes: Optional[int] = 0
    overtime: bool = False
    overtime_minutes: Optional[int] = 0
    device_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class AttendanceListResponse(BaseModel):
    """Schema for paginated attendance list."""
    total: int
    records: list[AttendanceWithEmployee]


class AttendanceMarkResponse(BaseModel):
    """Response after marking attendance."""
    success: bool
    message: str
    employee_no: str
    employee_name: str
    action: str  # "time_in", "time_out", or "already_marked"
    time: Optional[time] = None


class DailyAttendanceSummary(BaseModel):
    """Summary of attendance for a specific date."""
    date: date
    total_employees: int
    present: int
    absent: int
    on_time: int
    late: int
    overtime_count: int
