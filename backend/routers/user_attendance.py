"""
Manual attendance routes.
Allows users and secondary admins to mark attendance for employees.
Only primary admin can update attendance records.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, time, datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from auth.dependencies import require_roles
from database import get_db
from models.attendance import Attendance
from models.employee import Employee

router = APIRouter(prefix="/manual-attendance", tags=["Manual Attendance"])


class ManualAttendanceRequest(BaseModel):
    """Request to mark attendance manually."""
    employee_no: str = Field(..., description="Employee number")


class ManualAttendanceResponse(BaseModel):
    """Response for manual attendance marking."""
    id: int
    employee_no: str
    employee_name: str
    attendance_date: date
    time_in: Optional[time] = None
    time_out: Optional[time] = None
    total_work_minutes: Optional[int] = 0
    action: str  # "time_in", "time_out", "already_marked"
    message: str

    class Config:
        from_attributes = True


class AttendanceUpdateRequest(BaseModel):
    """Request to update attendance (primary admin only)."""
    time_in: Optional[str] = None  # HH:MM format
    time_out: Optional[str] = None  # HH:MM format


class EmployeeAttendanceStatus(BaseModel):
    """Employee with today's attendance status."""
    employee_no: str
    name: str
    department: Optional[str] = None
    attendance_id: Optional[int] = None
    time_in: Optional[time] = None
    time_out: Optional[time] = None
    status: str  # "not_marked", "time_in_only", "complete"


@router.get("/employees-status", response_model=List[EmployeeAttendanceStatus])
async def get_employees_attendance_status(
    payload: dict = Depends(require_roles({"user", "secondary_admin", "primary_admin"})),
    db: Session = Depends(get_db),
):
    """Get all employees with their attendance status for today."""
    today = date.today()
    
    # Get all employees
    employees = db.query(Employee).all()
    
    result = []
    for emp in employees:
        # Get today's attendance for this employee
        attendance = db.query(Attendance).filter(
            Attendance.employee_no == emp.employee_no,
            Attendance.attendance_date == today
        ).first()
        
        if attendance is None:
            status = "not_marked"
            att_id = None
            time_in = None
            time_out = None
        elif attendance.time_out is None:
            status = "time_in_only"
            att_id = attendance.id
            time_in = attendance.time_in
            time_out = None
        else:
            status = "complete"
            att_id = attendance.id
            time_in = attendance.time_in
            time_out = attendance.time_out
        
        result.append(EmployeeAttendanceStatus(
            employee_no=emp.employee_no,
            name=emp.name,
            department=emp.department,
            attendance_id=att_id,
            time_in=time_in,
            time_out=time_out,
            status=status
        ))
    
    return result


@router.post("/time-in", response_model=ManualAttendanceResponse)
async def mark_employee_time_in(
    request: ManualAttendanceRequest,
    payload: dict = Depends(require_roles({"user", "secondary_admin"})),
    db: Session = Depends(get_db),
):
    """Mark time in for an employee. Users and secondary admins only."""
    today = date.today()
    now = datetime.now().time()
    
    # Find employee
    employee = db.query(Employee).filter(Employee.employee_no == request.employee_no).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with number '{request.employee_no}' not found"
        )
    
    # Check if already marked for today
    attendance = db.query(Attendance).filter(
        Attendance.employee_no == request.employee_no,
        Attendance.attendance_date == today
    ).first()
    
    if attendance and attendance.time_in:
        return ManualAttendanceResponse(
            id=attendance.id,
            employee_no=employee.employee_no,
            employee_name=employee.name,
            attendance_date=today,
            time_in=attendance.time_in,
            time_out=attendance.time_out,
            total_work_minutes=attendance.total_work_minutes or 0,
            action="already_marked",
            message=f"Time in already recorded for {employee.name} today"
        )
    
    if not attendance:
        # Create new attendance record
        attendance = Attendance(
            employee_no=request.employee_no,
            attendance_date=today,
            time_in=now,
            device_id="MANUAL_ENTRY"
        )
        db.add(attendance)
    else:
        attendance.time_in = now
    
    db.commit()
    db.refresh(attendance)
    
    return ManualAttendanceResponse(
        id=attendance.id,
        employee_no=employee.employee_no,
        employee_name=employee.name,
        attendance_date=today,
        time_in=attendance.time_in,
        time_out=attendance.time_out,
        total_work_minutes=attendance.total_work_minutes or 0,
        action="time_in",
        message=f"Time in recorded for {employee.name} at {now.strftime('%H:%M')}"
    )


@router.post("/time-out", response_model=ManualAttendanceResponse)
async def mark_employee_time_out(
    request: ManualAttendanceRequest,
    payload: dict = Depends(require_roles({"user", "secondary_admin"})),
    db: Session = Depends(get_db),
):
    """Mark time out for an employee. Users and secondary admins only."""
    today = date.today()
    now = datetime.now().time()
    
    # Find employee
    employee = db.query(Employee).filter(Employee.employee_no == request.employee_no).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with number '{request.employee_no}' not found"
        )
    
    # Check if time_in exists
    attendance = db.query(Attendance).filter(
        Attendance.employee_no == request.employee_no,
        Attendance.attendance_date == today
    ).first()
    
    if not attendance or not attendance.time_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Please mark time in first for {employee.name}"
        )
    
    if attendance.time_out:
        return ManualAttendanceResponse(
            id=attendance.id,
            employee_no=employee.employee_no,
            employee_name=employee.name,
            attendance_date=today,
            time_in=attendance.time_in,
            time_out=attendance.time_out,
            total_work_minutes=attendance.total_work_minutes or 0,
            action="already_marked",
            message=f"Time out already recorded for {employee.name} today"
        )
    
    # Calculate work duration
    time_in_dt = datetime.combine(today, attendance.time_in)
    time_out_dt = datetime.combine(today, now)
    work_minutes = int((time_out_dt - time_in_dt).total_seconds() / 60)
    
    attendance.time_out = now
    attendance.total_work_minutes = work_minutes
    attendance.overtime = work_minutes > 480  # > 8 hours
    attendance.overtime_minutes = max(0, work_minutes - 480) if work_minutes > 480 else 0
    
    db.commit()
    db.refresh(attendance)
    
    hours = work_minutes // 60
    mins = work_minutes % 60
    
    return ManualAttendanceResponse(
        id=attendance.id,
        employee_no=employee.employee_no,
        employee_name=employee.name,
        attendance_date=today,
        time_in=attendance.time_in,
        time_out=attendance.time_out,
        total_work_minutes=attendance.total_work_minutes or 0,
        action="time_out",
        message=f"Time out recorded for {employee.name}. Total: {hours}h {mins}m"
    )


# Primary admin endpoint to update attendance
@router.put("/{attendance_id}", response_model=ManualAttendanceResponse)
async def update_attendance(
    attendance_id: int,
    update_data: AttendanceUpdateRequest,
    payload: dict = Depends(require_roles({"primary_admin"})),
    db: Session = Depends(get_db),
):
    """Update an attendance record. Primary admin only."""
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )
    
    # Get employee name
    employee = db.query(Employee).filter(Employee.employee_no == attendance.employee_no).first()
    employee_name = employee.name if employee else attendance.employee_no
    
    if update_data.time_in:
        try:
            attendance.time_in = datetime.strptime(update_data.time_in, "%H:%M").time()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid time_in format. Use HH:MM"
            )
    
    if update_data.time_out:
        try:
            attendance.time_out = datetime.strptime(update_data.time_out, "%H:%M").time()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid time_out format. Use HH:MM"
            )
    
    # Recalculate work duration if both times are set
    if attendance.time_in and attendance.time_out:
        time_in_dt = datetime.combine(attendance.attendance_date, attendance.time_in)
        time_out_dt = datetime.combine(attendance.attendance_date, attendance.time_out)
        work_minutes = int((time_out_dt - time_in_dt).total_seconds() / 60)
        attendance.total_work_minutes = work_minutes
        attendance.overtime = work_minutes > 480
        attendance.overtime_minutes = max(0, work_minutes - 480) if work_minutes > 480 else 0
    
    db.commit()
    db.refresh(attendance)
    
    return ManualAttendanceResponse(
        id=attendance.id,
        employee_no=attendance.employee_no,
        employee_name=employee_name,
        attendance_date=attendance.attendance_date,
        time_in=attendance.time_in,
        time_out=attendance.time_out,
        total_work_minutes=attendance.total_work_minutes or 0,
        action="updated",
        message="Attendance updated successfully"
    )
