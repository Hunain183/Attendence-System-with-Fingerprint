"""
Salary service - Business logic for salary management.
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, extract
from typing import List, Optional
from datetime import datetime

from models.salary import Salary
from models.employee import Employee
from models.attendance import Attendance
from schemas.salary import SalaryCreate, SalaryUpdate, SalaryCalculate
from utils.shifts import get_shift_hours


def calculate_salary_amount(
    rate_of_pay: float,
    total_days_worked: int,
    overtime_hours: float,
    shift: str = "D"
) -> dict:
    """
    Calculate salary amount based on days worked and overtime.
    
    Args:
        rate_of_pay: Daily rate of pay
        total_days_worked: Number of days worked
        overtime_hours: Total overtime hours
        shift: Shift type (D/A/B/C/G)
    
    Returns:
        dict with amount and breakdown
    """
    # Regular amount
    regular_amount = rate_of_pay * total_days_worked
    
    # Overtime calculation (assuming overtime pay is 1.5x hourly rate)
    # Convert daily rate to hourly rate based on shift
    shift_hours = get_shift_hours(shift)
    hourly_rate = rate_of_pay / shift_hours
    overtime_rate = hourly_rate * 1.5
    overtime_amount = overtime_hours * overtime_rate
    
    total_amount = regular_amount + overtime_amount
    
    return {
        "regular_amount": round(regular_amount, 2),
        "overtime_amount": round(overtime_amount, 2),
        "total_amount": round(total_amount, 2)
    }


def get_employee_attendance_summary(
    db: Session,
    employee_id: int,
    month: str
) -> dict:
    """
    Get attendance summary for an employee for a specific month.
    
    Args:
        db: Database session
        employee_id: Employee ID
        month: Month in YYYY-MM format
    
    Returns:
        dict with attendance summary
    """
    # Parse month
    year, month_num = map(int, month.split('-'))
    
    # Query attendance records for the month
    attendance_records = db.query(Attendance).filter(
        and_(
            Attendance.employee_id == employee_id,
            extract('year', Attendance.date) == year,
            extract('month', Attendance.date) == month_num
        )
    ).all()
    
    total_days = len(attendance_records)
    total_overtime_hours = sum(
        record.overtime_hours or 0 for record in attendance_records
    )
    
    return {
        "total_days_worked": total_days,
        "total_overtime_hours": round(total_overtime_hours, 2),
        "attendance_records": len(attendance_records)
    }


def create_salary_record(
    db: Session,
    salary_data: SalaryCreate
) -> Salary:
    """Create a new salary record."""
    # Calculate amounts
    employee = db.query(Employee).filter(Employee.id == salary_data.employee_id).first()
    shift = employee.shift if employee else "D"
    
    calc = calculate_salary_amount(
        rate_of_pay=salary_data.rate_of_pay,
        total_days_worked=salary_data.total_days_worked,
        overtime_hours=salary_data.overtime_hours,
        shift=shift
    )
    
    amount = calc["total_amount"]
    net_amount = amount - salary_data.advance
    
    # Create salary record
    salary = Salary(
        **salary_data.model_dump(),
        amount=amount,
        net_amount=net_amount
    )
    
    db.add(salary)
    db.commit()
    db.refresh(salary)
    return salary


def auto_calculate_salary(
    db: Session,
    calc_data: SalaryCalculate
) -> Salary:
    """
    Automatically calculate and create salary based on attendance records.
    
    Args:
        db: Database session
        calc_data: Calculation parameters
    
    Returns:
        Created salary record
    """
    # Get employee
    employee = db.query(Employee).filter(Employee.id == calc_data.employee_id).first()
    if not employee:
        raise ValueError("Employee not found")
    
    # Get attendance summary
    attendance_summary = get_employee_attendance_summary(
        db=db,
        employee_id=calc_data.employee_id,
        month=calc_data.month
    )
    
    # Create salary record
    salary_data = SalaryCreate(
        employee_id=calc_data.employee_id,
        month=calc_data.month,
        rate_of_pay=calc_data.rate_of_pay,
        month_days=30,  # Default
        overtime_hours=attendance_summary["total_overtime_hours"],
        total_days_worked=attendance_summary["total_days_worked"],
        advance=calc_data.advance,
        status="pending"
    )
    
    return create_salary_record(db, salary_data)


def get_salary_by_id(db: Session, salary_id: int) -> Optional[Salary]:
    """Get salary record by ID."""
    return db.query(Salary).filter(Salary.id == salary_id).first()


def get_employee_salaries(
    db: Session,
    employee_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[Salary]:
    """Get all salary records for an employee."""
    return db.query(Salary).filter(
        Salary.employee_id == employee_id
    ).order_by(Salary.month.desc()).offset(skip).limit(limit).all()


def get_all_salaries(
    db: Session,
    month: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Salary]:
    """Get all salary records with optional filters."""
    query = db.query(Salary)
    
    if month:
        query = query.filter(Salary.month == month)
    if status:
        query = query.filter(Salary.status == status)
    
    return query.order_by(Salary.month.desc(), Salary.id.desc()).offset(skip).limit(limit).all()


def update_salary(
    db: Session,
    salary_id: int,
    salary_data: SalaryUpdate
) -> Optional[Salary]:
    """Update a salary record."""
    salary = get_salary_by_id(db, salary_id)
    if not salary:
        return None
    
    # Update fields
    update_data = salary_data.model_dump(exclude_unset=True)
    
    # Recalculate if relevant fields changed
    if any(key in update_data for key in ['rate_of_pay', 'total_days_worked', 'overtime_hours', 'advance']):
        employee = db.query(Employee).filter(Employee.id == salary.employee_id).first()
        shift = employee.shift if employee else "D"
        
        calc = calculate_salary_amount(
            rate_of_pay=update_data.get('rate_of_pay', salary.rate_of_pay),
            total_days_worked=update_data.get('total_days_worked', salary.total_days_worked),
            overtime_hours=update_data.get('overtime_hours', salary.overtime_hours),
            shift=shift
        )
        
        update_data['amount'] = calc["total_amount"]
        update_data['net_amount'] = calc["total_amount"] - update_data.get('advance', salary.advance)
    
    for key, value in update_data.items():
        setattr(salary, key, value)
    
    db.commit()
    db.refresh(salary)
    return salary


def delete_salary(db: Session, salary_id: int) -> bool:
    """Delete a salary record."""
    salary = get_salary_by_id(db, salary_id)
    if not salary:
        return False
    
    db.delete(salary)
    db.commit()
    return True
