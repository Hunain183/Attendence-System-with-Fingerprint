"""
Salary router - Salary management endpoints for admin.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from auth.dependencies import get_current_admin, require_roles
from schemas.salary import SalaryCreate, SalaryUpdate, SalaryResponse, SalaryCalculate
from services import salary_service
from models.employee import Employee
from models.salary import Salary

router = APIRouter(prefix="/admin/salaries", tags=["Salary Management"])


@router.post("/", response_model=SalaryResponse, status_code=status.HTTP_201_CREATED)
def create_salary(
    salary_data: SalaryCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin)
):
    """
    Create a new salary record.
    Requires admin authentication.
    """
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.id == salary_data.employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Check if salary already exists for this month
    existing = db.query(Salary).filter(
        Salary.employee_id == salary_data.employee_id,
        Salary.month == salary_data.month
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Salary record already exists for employee {employee.name} for {salary_data.month}"
        )
    
    salary = salary_service.create_salary_record(db, salary_data)
    
    # Add employee details to response
    response = SalaryResponse.model_validate(salary)
    response.employee_name = employee.name
    response.designation = employee.designation
    
    return response


@router.post("/calculate", response_model=SalaryResponse, status_code=status.HTTP_201_CREATED)
def calculate_salary(
    calc_data: SalaryCalculate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin)
):
    """
    Auto-calculate salary based on attendance records.
    Requires admin authentication.
    """
    try:
        salary = salary_service.auto_calculate_salary(db, calc_data)
        
        # Add employee details
        employee = db.query(Employee).filter(Employee.id == salary.employee_id).first()
        response = SalaryResponse.model_validate(salary)
        response.employee_name = employee.name if employee else None
        response.designation = employee.designation if employee else None
        
        return response
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/", response_model=List[SalaryResponse])
def get_salaries(
    month: Optional[str] = Query(None, description="Filter by month (YYYY-MM)"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin)
):
    """
    Get all salary records with optional filters.
    Requires admin authentication.
    """
    salaries = salary_service.get_all_salaries(
        db=db,
        month=month,
        status=status_filter,
        skip=skip,
        limit=limit
    )
    
    # Enrich with employee details
    response_list = []
    for salary in salaries:
        employee = db.query(Employee).filter(Employee.id == salary.employee_id).first()
        response = SalaryResponse.model_validate(salary)
        response.employee_name = employee.name if employee else "Unknown"
        response.designation = employee.designation if employee else None
        response_list.append(response)
    
    return response_list


@router.get("/{salary_id}", response_model=SalaryResponse)
def get_salary(
    salary_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin)
):
    """
    Get a specific salary record by ID.
    Requires admin authentication.
    """
    salary = salary_service.get_salary_by_id(db, salary_id)
    if not salary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Salary record not found"
        )
    
    # Add employee details
    employee = db.query(Employee).filter(Employee.id == salary.employee_id).first()
    response = SalaryResponse.model_validate(salary)
    response.employee_name = employee.name if employee else "Unknown"
    response.designation = employee.designation if employee else None
    
    return response


@router.get("/employee/{employee_id}", response_model=List[SalaryResponse])
def get_employee_salaries(
    employee_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin)
):
    """
    Get all salary records for a specific employee.
    Requires admin authentication.
    """
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    salaries = salary_service.get_employee_salaries(
        db=db,
        employee_id=employee_id,
        skip=skip,
        limit=limit
    )
    
    # Enrich with employee details
    response_list = []
    for salary in salaries:
        response = SalaryResponse.model_validate(salary)
        response.employee_name = employee.name
        response.designation = employee.designation
        response_list.append(response)
    
    return response_list


@router.put("/{salary_id}", response_model=SalaryResponse)
def update_salary(
    salary_id: int,
    salary_data: SalaryUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin)
):
    """
    Update a salary record.
    Requires admin authentication.
    """
    salary = salary_service.update_salary(db, salary_id, salary_data)
    if not salary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Salary record not found"
        )
    
    # Add employee details
    employee = db.query(Employee).filter(Employee.id == salary.employee_id).first()
    response = SalaryResponse.model_validate(salary)
    response.employee_name = employee.name if employee else "Unknown"
    response.designation = employee.designation if employee else None
    
    return response


@router.delete("/{salary_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_salary(
    salary_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles({"primary_admin"}))  # Only primary admin can delete
):
    """
    Delete a salary record.
    Requires primary admin authentication.
    """
    success = salary_service.delete_salary(db, salary_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Salary record not found"
        )
    
    return None
