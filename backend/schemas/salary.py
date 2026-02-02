"""
Salary schemas - Request/Response models for salary management.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SalaryBase(BaseModel):
    """Base salary schema with common fields."""
    employee_id: int
    month: str = Field(..., description="Month in YYYY-MM format")
    rate_of_pay: float = Field(..., gt=0, description="Daily or hourly rate")
    month_days: int = Field(default=30, ge=1, le=31)
    overtime_hours: float = Field(default=0.0, ge=0)
    total_days_worked: int = Field(default=0, ge=0)
    advance: float = Field(default=0.0, ge=0)
    notes: Optional[str] = None
    signature: Optional[str] = None
    status: str = Field(default="pending")


class SalaryCreate(SalaryBase):
    """Schema for creating a new salary record."""
    pass


class SalaryUpdate(BaseModel):
    """Schema for updating an existing salary record."""
    rate_of_pay: Optional[float] = Field(None, gt=0)
    month_days: Optional[int] = Field(None, ge=1, le=31)
    overtime_hours: Optional[float] = Field(None, ge=0)
    total_days_worked: Optional[int] = Field(None, ge=0)
    advance: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None
    signature: Optional[str] = None
    status: Optional[str] = None


class SalaryResponse(SalaryBase):
    """Schema for salary response with calculated fields."""
    id: int
    amount: float
    net_amount: float
    created_at: datetime
    updated_at: datetime
    
    # Employee details
    employee_name: Optional[str] = None
    designation: Optional[str] = None
    
    class Config:
        from_attributes = True


class SalaryCalculate(BaseModel):
    """Schema for calculating salary based on attendance."""
    employee_id: int
    month: str = Field(..., description="Month in YYYY-MM format")
    rate_of_pay: float = Field(..., gt=0)
    advance: float = Field(default=0.0, ge=0)
