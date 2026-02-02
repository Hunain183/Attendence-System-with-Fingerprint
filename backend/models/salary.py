"""
Salary model - Stores employee salary records.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Salary(Base):
    """
    Salary records table.
    Stores monthly salary information for employees.
    """
    __tablename__ = "salaries"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Foreign key to employee
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    
    # Salary details
    month = Column(String(7), nullable=False)  # Format: YYYY-MM (e.g., "2026-01")
    rate_of_pay = Column(Float, nullable=False)  # Daily or hourly rate
    month_days = Column(Integer, default=30)  # Total working days in month
    overtime_hours = Column(Float, default=0.0)  # Total overtime hours
    total_days_worked = Column(Integer, default=0)  # Actual days worked
    amount = Column(Float, default=0.0)  # Total amount (before deductions)
    advance = Column(Float, default=0.0)  # Advance payment deducted
    net_amount = Column(Float, default=0.0)  # Final amount to pay
    
    # Additional fields
    notes = Column(Text, nullable=True)  # Any notes or comments
    signature = Column(Text, nullable=True)  # Digital signature or approval
    
    # Status
    status = Column(String(20), default="pending")  # pending, approved, paid
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationship
    employee = relationship("Employee", backref="salaries")
