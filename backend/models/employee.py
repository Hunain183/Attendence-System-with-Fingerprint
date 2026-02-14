"""
Employee model - Master table for employee data.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Employee(Base):
    """
    Employee master table.
    Stores all employee information including encrypted fingerprint template.
    """
    __tablename__ = "employees"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Unique employee identifier
    employee_no = Column(String(50), unique=True, nullable=False, index=True)
    
    # Personal information
    name = Column(String(100), nullable=False)
    father_name = Column(String(100), nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    cnic = Column(String(15), nullable=True)  # Format: 12345-1234567-1
    phone_number = Column(String(20), nullable=True)
    picture = Column(Text, nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    marital_status = Column(String(20), nullable=True)
    emergency_contact_no = Column(String(20), nullable=True)
    permanent_address = Column(Text, nullable=True)
    current_address = Column(Text, nullable=True)
    
    # References
    reference_1 = Column(String(200), nullable=True)
    reference_2 = Column(String(200), nullable=True)
    reference_address_1 = Column(Text, nullable=True)
    reference_address_2 = Column(Text, nullable=True)
    
    # Employment details
    employment_type = Column(String(50), nullable=True)  # e.g., Full-time, Part-time, Contract
    designation = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    hod = Column(String(100), nullable=True)  # Head of Department
    sub_department = Column(String(100), nullable=True)
    date_of_joining = Column(DateTime, nullable=True)
    shift = Column(String(10), nullable=True)  # A(12), B(12), E, G(Off), G, M, N
    is_overtime = Column(Boolean, nullable=True, default=True)  # Calculate overtime for this employee
    rest_day = Column(String(50), nullable=True)  # e.g., Friday, Saturday
    quit_date = Column(DateTime, nullable=True)
    remarks = Column(Text, nullable=True)
    
    # Salary details
    monthly_salary = Column(Integer, nullable=True)  # in rupees
    rate_per_day = Column(Integer, nullable=True)  # calculated: monthly_salary / days_in_month
    increment = Column(Integer, nullable=True)  # salary increment in rupees
    date_of_increment = Column(DateTime, nullable=True)
    total_salary = Column(Integer, nullable=True)  # monthly_salary + increment
    
    # Previous employment
    previous_employer = Column(String(200), nullable=True)
    previous_employer_address = Column(Text, nullable=True)
    previous_designation = Column(String(100), nullable=True)
    previous_period_of_service = Column(String(200), nullable=True)  # e.g., "Jan 2020 - Dec 2022"
    
    # Fingerprint template (encrypted)
    fingerprint_template = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationship to attendance records
    attendance_records = relationship("Attendance", back_populates="employee")
    
    def __repr__(self):
        return f"<Employee(id={self.id}, employee_no='{self.employee_no}', name='{self.name}')>"
