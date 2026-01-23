"""
Employee service - Business logic for employee operations.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from models.employee import Employee
from schemas.employee import EmployeeCreate, EmployeeUpdate, FingerprintEnroll
from utils.encryption import encryption_service


class EmployeeService:
    """Service class for employee CRUD operations."""
    
    @staticmethod
    def create_employee(db: Session, employee_data: EmployeeCreate) -> Employee:
        """
        Create a new employee.
        
        Args:
            db: Database session
            employee_data: Employee creation data
            
        Returns:
            Created employee instance
            
        Raises:
            ValueError: If employee_no already exists
        """
        # Check if employee_no already exists
        existing = db.query(Employee).filter(
            Employee.employee_no == employee_data.employee_no
        ).first()
        
        if existing:
            raise ValueError(f"Employee with employee_no '{employee_data.employee_no}' already exists")
        
        # Create employee instance
        employee = Employee(**employee_data.model_dump())
        
        try:
            db.add(employee)
            db.commit()
            db.refresh(employee)
            return employee
        except IntegrityError:
            db.rollback()
            raise ValueError("Failed to create employee. Employee number may already exist.")
    
    @staticmethod
    def get_employee_by_id(db: Session, employee_id: int) -> Optional[Employee]:
        """Get employee by ID."""
        return db.query(Employee).filter(Employee.id == employee_id).first()
    
    @staticmethod
    def get_employee_by_employee_no(db: Session, employee_no: str) -> Optional[Employee]:
        """Get employee by employee number."""
        return db.query(Employee).filter(Employee.employee_no == employee_no).first()
    
    @staticmethod
    def get_all_employees(
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        department: Optional[str] = None,
        search: Optional[str] = None
    ) -> tuple[List[Employee], int]:
        """
        Get all employees with pagination and optional filters.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum records to return
            department: Filter by department
            search: Search by name or employee_no
            
        Returns:
            Tuple of (employees list, total count)
        """
        query = db.query(Employee)
        
        # Apply filters
        if department:
            query = query.filter(Employee.department == department)
        
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (Employee.name.ilike(search_pattern)) |
                (Employee.employee_no.ilike(search_pattern))
            )
        
        # Get total count before pagination
        total = query.count()
        
        # Apply pagination
        employees = query.order_by(Employee.id).offset(skip).limit(limit).all()
        
        return employees, total
    
    @staticmethod
    def update_employee(
        db: Session, 
        employee_id: int, 
        update_data: EmployeeUpdate
    ) -> Optional[Employee]:
        """
        Update an existing employee.
        
        Args:
            db: Database session
            employee_id: ID of employee to update
            update_data: Fields to update
            
        Returns:
            Updated employee or None if not found
            
        Raises:
            ValueError: If updating to a duplicate employee_no
        """
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        
        if not employee:
            return None
        
        # Get update data, excluding unset fields
        update_dict = update_data.model_dump(exclude_unset=True)
        
        # Check if updating employee_no to an existing one
        if "employee_no" in update_dict:
            existing = db.query(Employee).filter(
                Employee.employee_no == update_dict["employee_no"],
                Employee.id != employee_id
            ).first()
            if existing:
                raise ValueError(f"Employee with employee_no '{update_dict['employee_no']}' already exists")
        
        # Update fields
        for field, value in update_dict.items():
            setattr(employee, field, value)
        
        try:
            db.commit()
            db.refresh(employee)
            return employee
        except IntegrityError:
            db.rollback()
            raise ValueError("Failed to update employee. Employee number may already exist.")
    
    @staticmethod
    def delete_employee(db: Session, employee_id: int) -> bool:
        """
        Delete an employee.
        
        Args:
            db: Database session
            employee_id: ID of employee to delete
            
        Returns:
            True if deleted, False if not found
        """
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        
        if not employee:
            return False
        
        db.delete(employee)
        db.commit()
        return True
    
    @staticmethod
    def enroll_fingerprint(
        db: Session, 
        enroll_data: FingerprintEnroll
    ) -> Optional[Employee]:
        """
        Enroll or update employee fingerprint.
        Encrypts the fingerprint template before storing.
        
        Args:
            db: Database session
            enroll_data: Fingerprint enrollment data
            
        Returns:
            Updated employee or None if not found
        """
        employee = db.query(Employee).filter(
            Employee.employee_no == enroll_data.employee_no
        ).first()
        
        if not employee:
            return None
        
        # Encrypt and store fingerprint template
        encrypted_template = encryption_service.encrypt(enroll_data.fingerprint_template)
        employee.fingerprint_template = encrypted_template
        
        db.commit()
        db.refresh(employee)
        return employee
    
    @staticmethod
    def find_employee_by_fingerprint(db: Session, fingerprint_template: str) -> Optional[Employee]:
        """
        Find an employee by matching fingerprint template.
        
        In a real implementation, this would use fingerprint matching algorithms.
        For now, we iterate through all employees and compare templates.
        
        Args:
            db: Database session
            fingerprint_template: Raw fingerprint template from device
            
        Returns:
            Matching employee or None if no match
        """
        # Get all employees with enrolled fingerprints
        employees = db.query(Employee).filter(
            Employee.fingerprint_template.isnot(None)
        ).all()
        
        for employee in employees:
            if encryption_service.verify_fingerprint(
                fingerprint_template, 
                employee.fingerprint_template
            ):
                return employee
        
        return None


# Singleton instance
employee_service = EmployeeService()
