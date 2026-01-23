"""
Attendance model - Records employee attendance.
"""
from sqlalchemy import Column, Integer, String, Date, Time, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Attendance(Base):
    """
    Attendance records table.
    Links to employee via employee_no foreign key.
    """
    __tablename__ = "attendance"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Foreign key to employees table
    employee_no = Column(
        String(50), 
        ForeignKey("employees.employee_no", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    
    # Attendance date
    attendance_date = Column(Date, nullable=False, index=True)
    
    # Time records
    time_in = Column(Time, nullable=True)
    time_out = Column(Time, nullable=True)
    
    # Calculated work duration
    total_work_minutes = Column(Integer, nullable=True, default=0)
    
    # Overtime tracking (overtime if > 480 minutes / 8 hours)
    overtime = Column(Boolean, nullable=False, default=False)
    overtime_minutes = Column(Integer, nullable=True, default=0)
    
    # Device that recorded attendance
    device_id = Column(String(100), nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    # Relationship to employee
    employee = relationship("Employee", back_populates="attendance_records")
    
    def __repr__(self):
        return f"<Attendance(id={self.id}, employee_no='{self.employee_no}', date='{self.attendance_date}')>"
    
    def calculate_work_minutes(self) -> int:
        """
        Calculate total work minutes from time_in and time_out.
        Returns 0 if either time is not set.
        """
        if not self.time_in or not self.time_out:
            return 0
        
        # Convert times to minutes since midnight
        in_minutes = self.time_in.hour * 60 + self.time_in.minute
        out_minutes = self.time_out.hour * 60 + self.time_out.minute
        
        # Handle case where time_out is after midnight (next day)
        if out_minutes < in_minutes:
            out_minutes += 24 * 60
        
        return out_minutes - in_minutes
    
    def update_overtime(self):
        """
        Update overtime status based on total work minutes.
        Overtime threshold: 480 minutes (8 hours).
        """
        OVERTIME_THRESHOLD = 480
        
        if self.total_work_minutes and self.total_work_minutes > OVERTIME_THRESHOLD:
            self.overtime = True
            self.overtime_minutes = self.total_work_minutes - OVERTIME_THRESHOLD
        else:
            self.overtime = False
            self.overtime_minutes = 0
