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
    date_of_birth: Optional[datetime] = None
    cnic: Optional[str] = Field(None, max_length=15, description="CNIC format: 12345-1234567-1")
    phone_number: Optional[str] = Field(None, max_length=20)
    picture: Optional[str] = None
    gender: Optional[str] = Field(None, max_length=20)
    blood_group: Optional[str] = Field(None, max_length=10)
    marital_status: Optional[str] = Field(None, max_length=20)
    emergency_contact_no: Optional[str] = Field(None, max_length=20)
    permanent_address: Optional[str] = None
    current_address: Optional[str] = None
    employment_type: Optional[str] = Field(None, max_length=50, description="e.g., Full-time, Part-time, Contract")
    designation: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    hod: Optional[str] = Field(None, max_length=100, description="Head of Department")
    sub_department: Optional[str] = Field(None, max_length=100)
    date_of_joining: Optional[datetime] = None
    shift: Optional[str] = Field(None, max_length=10, description="A(12), B(12), E, G(Off), G, M, N")
    is_overtime: Optional[bool] = Field(True, description="Calculate overtime for this employee")
    rest_day: Optional[str] = Field(None, max_length=50, description="e.g., Friday, Saturday")
    quit_date: Optional[datetime] = None
    remarks: Optional[str] = None
    monthly_salary: Optional[int] = Field(None, description="Monthly salary in rupees")
    rate_per_day: Optional[int] = Field(None, description="Rate per day (auto-calculated)")
    increment: Optional[int] = Field(None, description="Increment amount in rupees")
    date_of_increment: Optional[datetime] = None
    total_salary: Optional[int] = Field(None, description="Monthly salary + increment")
    reference_1: Optional[str] = Field(None, max_length=200)
    reference_2: Optional[str] = Field(None, max_length=200)
    reference_address_1: Optional[str] = None
    reference_address_2: Optional[str] = None
    previous_employer: Optional[str] = Field(None, max_length=200)
    previous_employer_address: Optional[str] = None
    previous_designation: Optional[str] = Field(None, max_length=100)
    previous_period_of_service: Optional[str] = Field(None, max_length=200)


class EmployeeUpdate(BaseModel):
    """Schema for updating an employee. All fields optional."""
    employee_no: Optional[str] = Field(None, min_length=1, max_length=50)
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    father_name: Optional[str] = Field(None, max_length=100)
    date_of_birth: Optional[datetime] = None
    cnic: Optional[str] = Field(None, max_length=15)
    phone_number: Optional[str] = Field(None, max_length=20)
    picture: Optional[str] = None
    gender: Optional[str] = Field(None, max_length=20)
    blood_group: Optional[str] = Field(None, max_length=10)
    marital_status: Optional[str] = Field(None, max_length=20)
    emergency_contact_no: Optional[str] = Field(None, max_length=20)
    permanent_address: Optional[str] = None
    current_address: Optional[str] = None
    employment_type: Optional[str] = Field(None, max_length=50)
    designation: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    hod: Optional[str] = Field(None, max_length=100)
    sub_department: Optional[str] = Field(None, max_length=100)
    date_of_joining: Optional[datetime] = None
    shift: Optional[str] = Field(None, max_length=10)
    is_overtime: Optional[bool] = None
    rest_day: Optional[str] = Field(None, max_length=50)
    quit_date: Optional[datetime] = None
    remarks: Optional[str] = None
    monthly_salary: Optional[int] = None
    rate_per_day: Optional[int] = None
    increment: Optional[int] = None
    date_of_increment: Optional[datetime] = None
    total_salary: Optional[int] = None
    reference_1: Optional[str] = Field(None, max_length=200)
    reference_2: Optional[str] = Field(None, max_length=200)
    reference_address_1: Optional[str] = None
    reference_address_2: Optional[str] = None
    previous_employer: Optional[str] = Field(None, max_length=200)
    previous_employer_address: Optional[str] = None
    previous_designation: Optional[str] = Field(None, max_length=100)
    previous_period_of_service: Optional[str] = Field(None, max_length=200)


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
    date_of_birth: Optional[datetime] = None
    cnic: Optional[str] = None
    phone_number: Optional[str] = None
    picture: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    marital_status: Optional[str] = None
    emergency_contact_no: Optional[str] = None
    permanent_address: Optional[str] = None
    current_address: Optional[str] = None
    employment_type: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    hod: Optional[str] = None
    sub_department: Optional[str] = None
    date_of_joining: Optional[datetime] = None
    shift: Optional[str] = None
    is_overtime: Optional[bool] = None
    rest_day: Optional[str] = None
    quit_date: Optional[datetime] = None
    remarks: Optional[str] = None
    monthly_salary: Optional[int] = None
    rate_per_day: Optional[int] = None
    increment: Optional[int] = None
    date_of_increment: Optional[datetime] = None
    total_salary: Optional[int] = None
    reference_1: Optional[str] = None
    reference_2: Optional[str] = None
    reference_address_1: Optional[str] = None
    reference_address_2: Optional[str] = None
    previous_employer: Optional[str] = None
    previous_employer_address: Optional[str] = None
    previous_designation: Optional[str] = None
    previous_period_of_service: Optional[str] = None
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
