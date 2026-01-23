"""
Pydantic schemas for Employee.
Handles request/response validation.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


# ==================== Request Schemas ====================

class EmployeeCreate(BaseModel):
    """Schema for creating a new employee."""
    employee_no: str = Field(..., min_length=1, max_length=50, description="Unique employee number")
    name: str = Field(..., min_length=1, max_length=100, description="Employee full name")
    father_name: Optional[str] = Field(None, max_length=100)
    cnic: Optional[str] = Field(None, max_length=15, pattern=r"^\d{5}-\d{7}-\d$", description="CNIC format: 12345-1234567-1")
    phone_number: Optional[str] = Field(None, max_length=20)
    permanent_address: Optional[str] = None
    current_address: Optional[str] = None
    employment_type: Optional[str] = Field(None, max_length=50, description="e.g., Full-time, Part-time, Contract")
    designation: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    date_of_joining: Optional[datetime] = None


class EmployeeUpdate(BaseModel):
    """Schema for updating an employee. All fields optional."""
    employee_no: Optional[str] = Field(None, min_length=1, max_length=50)
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    father_name: Optional[str] = Field(None, max_length=100)
    cnic: Optional[str] = Field(None, max_length=15, pattern=r"^\d{5}-\d{7}-\d$")
    phone_number: Optional[str] = Field(None, max_length=20)
    permanent_address: Optional[str] = None
    current_address: Optional[str] = None
    employment_type: Optional[str] = Field(None, max_length=50)
    designation: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    date_of_joining: Optional[datetime] = None


class FingerprintEnroll(BaseModel):
    """Schema for enrolling employee fingerprint."""
    employee_no: str = Field(..., min_length=1, max_length=50)
    fingerprint_template: str = Field(..., min_length=1, description="Raw fingerprint template from device")


# ==================== Response Schemas ====================

class EmployeeResponse(BaseModel):
    """Schema for employee response (excludes fingerprint template)."""
    id: int
    employee_no: str
    name: str
    father_name: Optional[str] = None
    cnic: Optional[str] = None
    phone_number: Optional[str] = None
    permanent_address: Optional[str] = None
    current_address: Optional[str] = None
    employment_type: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    date_of_joining: Optional[datetime] = None
    has_fingerprint: bool = False  # Indicates if fingerprint is enrolled
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class EmployeeListResponse(BaseModel):
    """Schema for paginated employee list."""
    total: int
    employees: list[EmployeeResponse]


class EmployeeMinimal(BaseModel):
    """Minimal employee info for attendance records."""
    employee_no: str
    name: str
    department: Optional[str] = None
    designation: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
