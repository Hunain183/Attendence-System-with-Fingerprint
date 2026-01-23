"""
Attendance service - Business logic for attendance operations.
"""
from typing import Optional, List
from datetime import date, time, datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_

from models.attendance import Attendance
from models.employee import Employee
from services.employee_service import employee_service


class AttendanceService:
    """Service class for attendance operations."""
    
    @staticmethod
    def mark_attendance(
        db: Session,
        fingerprint_template: str,
        device_id: str
    ) -> tuple[Optional[Attendance], str, Optional[Employee]]:
        """
        Mark attendance for an employee using fingerprint.
        
        Business Logic:
        - First scan of the day → time_in
        - Second scan of the day → time_out
        - If time_out exists → ignore (already marked)
        
        Args:
            db: Database session
            fingerprint_template: Raw fingerprint template from device
            device_id: ID of the attendance device
            
        Returns:
            Tuple of (attendance record, action, employee)
            action: "time_in", "time_out", "already_marked", or "not_found"
        """
        # Find employee by fingerprint
        employee = employee_service.find_employee_by_fingerprint(db, fingerprint_template)
        
        if not employee:
            return None, "not_found", None
        
        today = date.today()
        current_time = datetime.now().time()
        
        # Check if attendance record exists for today
        attendance = db.query(Attendance).filter(
            and_(
                Attendance.employee_no == employee.employee_no,
                Attendance.attendance_date == today
            )
        ).first()
        
        if attendance is None:
            # First scan - create record with time_in
            attendance = Attendance(
                employee_no=employee.employee_no,
                attendance_date=today,
                time_in=current_time,
                device_id=device_id
            )
            db.add(attendance)
            db.commit()
            db.refresh(attendance)
            return attendance, "time_in", employee
        
        elif attendance.time_out is None:
            # Second scan - set time_out
            attendance.time_out = current_time
            attendance.device_id = device_id
            
            # Calculate work minutes and overtime
            attendance.total_work_minutes = attendance.calculate_work_minutes()
            attendance.update_overtime()
            
            db.commit()
            db.refresh(attendance)
            return attendance, "time_out", employee
        
        else:
            # Already marked both time_in and time_out
            return attendance, "already_marked", employee
    
    @staticmethod
    def get_attendance_by_date(
        db: Session,
        attendance_date: date,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[dict], int]:
        """
        Get all attendance records for a specific date with employee details.
        
        Args:
            db: Database session
            attendance_date: Date to filter by
            skip: Pagination offset
            limit: Max records to return
            
        Returns:
            Tuple of (attendance records with employee info, total count)
        """
        query = db.query(Attendance, Employee).join(
            Employee, Attendance.employee_no == Employee.employee_no
        ).filter(
            Attendance.attendance_date == attendance_date
        )
        
        total = query.count()
        
        results = query.order_by(Attendance.time_in).offset(skip).limit(limit).all()
        
        # Format results
        records = []
        for attendance, employee in results:
            records.append({
                "id": attendance.id,
                "employee_no": attendance.employee_no,
                "employee_name": employee.name,
                "department": employee.department,
                "designation": employee.designation,
                "attendance_date": attendance.attendance_date,
                "time_in": attendance.time_in,
                "time_out": attendance.time_out,
                "total_work_minutes": attendance.total_work_minutes,
                "overtime": attendance.overtime,
                "overtime_minutes": attendance.overtime_minutes,
                "device_id": attendance.device_id
            })
        
        return records, total
    
    @staticmethod
    def get_attendance_by_employee(
        db: Session,
        employee_no: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[Attendance], int]:
        """
        Get attendance records for a specific employee.
        
        Args:
            db: Database session
            employee_no: Employee number to filter by
            start_date: Optional start date filter
            end_date: Optional end date filter
            skip: Pagination offset
            limit: Max records to return
            
        Returns:
            Tuple of (attendance records, total count)
        """
        query = db.query(Attendance).filter(
            Attendance.employee_no == employee_no
        )
        
        if start_date:
            query = query.filter(Attendance.attendance_date >= start_date)
        
        if end_date:
            query = query.filter(Attendance.attendance_date <= end_date)
        
        total = query.count()
        
        records = query.order_by(
            Attendance.attendance_date.desc()
        ).offset(skip).limit(limit).all()
        
        return records, total
    
    @staticmethod
    def get_all_attendance(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        department: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[dict], int]:
        """
        Get all attendance records with filters.
        
        Args:
            db: Database session
            start_date: Optional start date filter
            end_date: Optional end date filter
            department: Optional department filter
            skip: Pagination offset
            limit: Max records to return
            
        Returns:
            Tuple of (attendance records with employee info, total count)
        """
        query = db.query(Attendance, Employee).join(
            Employee, Attendance.employee_no == Employee.employee_no
        )
        
        if start_date:
            query = query.filter(Attendance.attendance_date >= start_date)
        
        if end_date:
            query = query.filter(Attendance.attendance_date <= end_date)
        
        if department:
            query = query.filter(Employee.department == department)
        
        total = query.count()
        
        results = query.order_by(
            Attendance.attendance_date.desc(),
            Attendance.time_in
        ).offset(skip).limit(limit).all()
        
        # Format results
        records = []
        for attendance, employee in results:
            records.append({
                "id": attendance.id,
                "employee_no": attendance.employee_no,
                "employee_name": employee.name,
                "department": employee.department,
                "designation": employee.designation,
                "attendance_date": attendance.attendance_date,
                "time_in": attendance.time_in,
                "time_out": attendance.time_out,
                "total_work_minutes": attendance.total_work_minutes,
                "overtime": attendance.overtime,
                "overtime_minutes": attendance.overtime_minutes,
                "device_id": attendance.device_id
            })
        
        return records, total
    
    @staticmethod
    def get_daily_summary(db: Session, target_date: date) -> dict:
        """
        Get attendance summary for a specific date.
        
        Args:
            db: Database session
            target_date: Date to get summary for
            
        Returns:
            Summary dictionary with counts
        """
        # Get total employees
        total_employees = db.query(Employee).count()
        
        # Get attendance records for the date
        attendance_records = db.query(Attendance).filter(
            Attendance.attendance_date == target_date
        ).all()
        
        present = len(attendance_records)
        absent = total_employees - present
        
        # Count overtime (worked more than 8 hours)
        overtime_count = sum(1 for a in attendance_records if a.overtime)
        
        # Count on-time (arrived before 9:00 AM) - configurable threshold
        on_time_threshold = time(9, 0, 0)
        on_time = sum(
            1 for a in attendance_records 
            if a.time_in and a.time_in <= on_time_threshold
        )
        late = present - on_time
        
        return {
            "date": target_date,
            "total_employees": total_employees,
            "present": present,
            "absent": absent,
            "on_time": on_time,
            "late": late,
            "overtime_count": overtime_count
        }


# Singleton instance
attendance_service = AttendanceService()
