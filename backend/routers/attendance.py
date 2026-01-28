"""
Attendance router - Admin endpoints and device endpoint for attendance.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from database import get_db
from auth.dependencies import get_current_admin, verify_device_api_key, require_roles
from services.attendance_service import attendance_service
from schemas.attendance import (
    AttendanceMark,
    AttendanceMarkResponse,
    AttendanceListResponse,
    AttendanceWithEmployee,
    DailyAttendanceSummary
)

# Admin router for attendance management
admin_router = APIRouter(prefix="/admin/attendance", tags=["Attendance Management"])

# Device router for marking attendance
device_router = APIRouter(prefix="/device/attendance", tags=["Device Attendance"])


# ==================== Device Endpoint ====================

@device_router.post("/mark", response_model=AttendanceMarkResponse)
async def mark_attendance(
    mark_data: AttendanceMark,
    db: Session = Depends(get_db),
    api_key_valid: bool = Depends(verify_device_api_key)
):
    """
    Mark attendance via fingerprint device.
    
    Requires valid API key in X-API-Key header.
    
    Business Logic:
    - First scan of the day → records time_in
    - Second scan of the day → records time_out
    - Subsequent scans → ignored (already marked)
    
    Args:
        mark_data: Fingerprint template and device ID
        
    Returns:
        Attendance marking result with employee info
        
    Raises:
        HTTPException 404: If fingerprint not recognized
    """
    attendance, action, employee = attendance_service.mark_attendance(
        db,
        fingerprint_template=mark_data.fingerprint_template,
        device_id=mark_data.device_id
    )
    
    if action == "not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fingerprint not recognized. Employee not found."
        )
    
    # Determine the time to return
    if action == "time_in":
        recorded_time = attendance.time_in
        message = f"Good morning, {employee.name}! Time in recorded."
    elif action == "time_out":
        recorded_time = attendance.time_out
        message = f"Goodbye, {employee.name}! Time out recorded. Worked {attendance.total_work_minutes} minutes."
    else:  # already_marked
        recorded_time = attendance.time_out
        message = f"Attendance already marked for today, {employee.name}."
    
    return AttendanceMarkResponse(
        success=True,
        message=message,
        employee_no=employee.employee_no,
        employee_name=employee.name,
        action=action,
        time=recorded_time
    )


# ==================== Admin Endpoints ====================

@admin_router.get("", response_model=AttendanceListResponse)
async def get_attendance(
    start_date: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    department: Optional[str] = Query(None, description="Filter by department"),
    employee_no: Optional[str] = Query(None, description="Filter by employee number"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    db: Session = Depends(get_db),
        admin: dict = Depends(require_roles({"primary_admin", "secondary_admin", "user"}))
):
    """
    Get attendance records with filters.
    
    Requires admin authentication.
    
    Args:
        start_date: Filter records from this date
        end_date: Filter records until this date
        department: Filter by employee department
        employee_no: Filter by specific employee
        skip: Pagination offset
        limit: Max records per page
        
    Returns:
        Paginated attendance records with employee info
    """
    if employee_no:
        # Get attendance for specific employee
        records, total = attendance_service.get_attendance_by_employee(
            db, employee_no, start_date, end_date, skip, limit
        )
        
        # We need employee info, so fetch it
        from services.employee_service import employee_service
        employee = employee_service.get_employee_by_employee_no(db, employee_no)
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with employee_no '{employee_no}' not found"
            )
        
        # Format records with employee info
        formatted = []
        for record in records:
            formatted.append(AttendanceWithEmployee(
                id=record.id,
                employee_no=record.employee_no,
                employee_name=employee.name,
                department=employee.department,
                designation=employee.designation,
                attendance_date=record.attendance_date,
                time_in=record.time_in,
                time_out=record.time_out,
                total_work_minutes=record.total_work_minutes,
                overtime=record.overtime,
                overtime_minutes=record.overtime_minutes,
                device_id=record.device_id
            ))
        
        return AttendanceListResponse(total=total, records=formatted)
    
    else:
        # Get all attendance with filters
        records, total = attendance_service.get_all_attendance(
            db, start_date, end_date, department, skip, limit
        )
        
        # Convert to response schema
        formatted = [AttendanceWithEmployee(**record) for record in records]
        
        return AttendanceListResponse(total=total, records=formatted)


@admin_router.get("/today", response_model=AttendanceListResponse)
async def get_today_attendance(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
        admin: dict = Depends(require_roles({"primary_admin", "secondary_admin", "user"}))
):
    """
    Get today's attendance records.
    
    Requires admin authentication.
    
    Returns:
        Today's attendance records with employee info
    """
    today = date.today()
    records, total = attendance_service.get_attendance_by_date(db, today, skip, limit)
    
    formatted = [AttendanceWithEmployee(**record) for record in records]
    
    return AttendanceListResponse(total=total, records=formatted)


@admin_router.get("/summary", response_model=DailyAttendanceSummary)
async def get_attendance_summary(
    target_date: date = Query(None, description="Date for summary (defaults to today)"),
    db: Session = Depends(get_db),
        admin: dict = Depends(require_roles({"primary_admin", "secondary_admin", "user"}))
):
    """
    Get attendance summary for a specific date.
    
    Requires admin authentication.
    
    Args:
        target_date: Date to get summary for (defaults to today)
        
    Returns:
        Summary with present/absent counts, overtime, etc.
    """
    if target_date is None:
        target_date = date.today()
    
    summary = attendance_service.get_daily_summary(db, target_date)
    
    return DailyAttendanceSummary(**summary)


@admin_router.get("/by-date/{target_date}", response_model=AttendanceListResponse)
async def get_attendance_by_date(
    target_date: date,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
        admin: dict = Depends(require_roles({"primary_admin", "secondary_admin", "user"}))
):
    """
    Get attendance records for a specific date.
    
    Requires admin authentication.
    
    Args:
        target_date: Date to get attendance for
        
    Returns:
        Attendance records for the specified date
    """
    records, total = attendance_service.get_attendance_by_date(db, target_date, skip, limit)
    
    formatted = [AttendanceWithEmployee(**record) for record in records]
    
    return AttendanceListResponse(total=total, records=formatted)
