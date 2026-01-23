"""
Employee model - Master table for employee data.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
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
    cnic = Column(String(15), nullable=True)  # Format: 12345-1234567-1
    phone_number = Column(String(20), nullable=True)
    permanent_address = Column(Text, nullable=True)
    current_address = Column(Text, nullable=True)
    
    # Employment details
    employment_type = Column(String(50), nullable=True)  # e.g., Full-time, Part-time, Contract
    designation = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    date_of_joining = Column(DateTime, nullable=True)
    
    # Fingerprint template (encrypted)
    fingerprint_template = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationship to attendance records
    attendance_records = relationship("Attendance", back_populates="employee")
    
    def __repr__(self):
        return f"<Employee(id={self.id}, employee_no='{self.employee_no}', name='{self.name}')>"
