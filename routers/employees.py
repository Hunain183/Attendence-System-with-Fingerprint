"""
Employee router - Admin endpoints for employee management.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from auth.dependencies import get_current_admin
from services.employee_service import employee_service
from schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListResponse,
    FingerprintEnroll
)

router = APIRouter(prefix="/admin/employees", tags=["Employee Management"])


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """
    Create a new employee.
    
    Requires admin authentication.
    
    Args:
        employee_data: Employee information
        
    Returns:
        Created employee data
        
    Raises:
        HTTPException 400: If employee_no already exists
    """
    try:
        employee = employee_service.create_employee(db, employee_data)
        
        # Add has_fingerprint flag
        response_data = EmployeeResponse.model_validate(employee)
        response_data.has_fingerprint = bool(employee.fingerprint_template)
        
        return response_data
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=EmployeeListResponse)
async def list_employees(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
    department: Optional[str] = Query(None, description="Filter by department"),
    search: Optional[str] = Query(None, description="Search by name or employee_no"),
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """
    Get list of all employees with pagination.
    
    Requires admin authentication.
    
    Args:
        skip: Pagination offset
        limit: Max records per page
        department: Optional department filter
        search: Optional search term
        
    Returns:
        Paginated list of employees
    """
    employees, total = employee_service.get_all_employees(
        db, skip=skip, limit=limit, department=department, search=search
    )
    
    # Convert to response schema with has_fingerprint flag
    employee_responses = []
    for emp in employees:
        resp = EmployeeResponse.model_validate(emp)
        resp.has_fingerprint = bool(emp.fingerprint_template)
        employee_responses.append(resp)
    
    return EmployeeListResponse(
        total=total,
        employees=employee_responses
    )


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """
    Get a single employee by ID.
    
    Requires admin authentication.
    
    Args:
        employee_id: Employee ID
        
    Returns:
        Employee data
        
    Raises:
        HTTPException 404: If employee not found
    """
    employee = employee_service.get_employee_by_id(db, employee_id)
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with id {employee_id} not found"
        )
    
    response = EmployeeResponse.model_validate(employee)
    response.has_fingerprint = bool(employee.fingerprint_template)
    
    return response


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: int,
    update_data: EmployeeUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """
    Update an existing employee.
    
    Requires admin authentication.
    Only provided fields will be updated.
    
    Args:
        employee_id: Employee ID to update
        update_data: Fields to update
        
    Returns:
        Updated employee data
        
    Raises:
        HTTPException 404: If employee not found
        HTTPException 400: If update fails (e.g., duplicate employee_no)
    """
    try:
        employee = employee_service.update_employee(db, employee_id, update_data)
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with id {employee_id} not found"
            )
        
        response = EmployeeResponse.model_validate(employee)
        response.has_fingerprint = bool(employee.fingerprint_template)
        
        return response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """
    Delete an employee.
    
    Requires admin authentication.
    Also deletes associated attendance records (cascade).
    
    Args:
        employee_id: Employee ID to delete
        
    Raises:
        HTTPException 404: If employee not found
    """
    deleted = employee_service.delete_employee(db, employee_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with id {employee_id} not found"
        )
    
    return None


@router.post("/enroll-fingerprint", response_model=EmployeeResponse)
async def enroll_fingerprint(
    enroll_data: FingerprintEnroll,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """
    Enroll or update employee fingerprint.
    
    Requires admin authentication.
    The fingerprint template is encrypted before storage.
    
    Args:
        enroll_data: Employee number and fingerprint template
        
    Returns:
        Updated employee data
        
    Raises:
        HTTPException 404: If employee not found
    """
    employee = employee_service.enroll_fingerprint(db, enroll_data)
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with employee_no '{enroll_data.employee_no}' not found"
        )
    
    response = EmployeeResponse.model_validate(employee)
    response.has_fingerprint = True
    
    return response
