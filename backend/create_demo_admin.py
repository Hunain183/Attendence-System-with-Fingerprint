"""
Create Demo Administrator Account

This script creates a demo administrator account with sample data for testing.
Run this AFTER the database has been initialized with init_db_production.py

Usage:
    python create_demo_admin.py

The script will create:
    - Admin account (username: demo_admin, password: change_me_123)
    - Demo employees with sample data
    - Sample attendance records
    - Demo salary records

IMPORTANT:
    - Change the default password before deploying to production
    - Do not use this script to create production admin accounts
    - Review and modify the sample data as needed
"""

import os
import sys
from datetime import datetime, timedelta
import random

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.user import User
from models.employee import Employee
from models.attendance import Attendance
from models.salary import Salary
from auth.jwt_handler import hash_password
from utils.config import settings


def create_demo_admin():
    """Create a demo administrator account."""
    db = SessionLocal()
    try:
        # Check if demo admin already exists
        existing = db.query(User).filter(User.username == "demo_admin").first()
        if existing:
            print("⚠️  Demo admin already exists")
            return existing
        
        # Create new demo admin
        admin = User(
            username="demo_admin",
            password_hash=hash_password("change_me_123"),
            role="secondary_admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print("✅ Demo admin created")
        print(f"   Username: demo_admin")
        print(f"   Password: change_me_123")
        print(f"   ⚠️  IMPORTANT: Change this password after testing!")
        return admin
    except Exception as e:
        print(f"❌ Error creating demo admin: {e}")
        db.rollback()
        return None
    finally:
        db.close()


def create_demo_employees():
    """Create demo employee accounts."""
    db = SessionLocal()
    try:
        # Check if demo employees already exist
        existing = db.query(Employee).filter(Employee.name.like("Demo Employee%")).count()
        if existing > 0:
            print(f"⚠️  {existing} demo employees already exist")
            return []
        
        demo_employees = []
        employee_names = ["Demo Employee 1", "Demo Employee 2", "Demo Employee 3"]
        
        for name in employee_names:
            employee = Employee(
                name=name,
                email=f"{name.lower().replace(' ', '_')}@example.com",
                phone_number="03001234567",
                father_name="Father Name",
                cnic="12345-1234567-1",
                date_of_joining=datetime.now() - timedelta(days=30),
                designation="Software Developer",
                department="IT",
                shift="A",
                gender="Male",
                blood_group="O+",
                employment_type="Full-time",
                status="active",
            )
            db.add(employee)
            demo_employees.append(employee)
        
        db.commit()
        print(f"✅ Created {len(demo_employees)} demo employees")
        return demo_employees
    except Exception as e:
        print(f"❌ Error creating demo employees: {e}")
        db.rollback()
        return []
    finally:
        db.close()


def create_demo_attendance(employees):
    """Create demo attendance records."""
    if not employees:
        print("⚠️  No employees to create attendance for")
        return
    
    db = SessionLocal()
    try:
        # Check if attendance records already exist
        existing = db.query(Attendance).count()
        if existing > 0:
            print(f"⚠️  {existing} attendance records already exist")
            return
        
        attendance_records = []
        for employee in employees:
            for day in range(1, 8):  # Create 7 days of records
                date = datetime.now() - timedelta(days=8-day)
                attendance = Attendance(
                    employee_id=employee.id,
                    attendance_date=date.date(),
                    time_in=datetime.combine(date.date(), datetime.strptime("09:00", "%H:%M").time()),
                    time_out=datetime.combine(date.date(), datetime.strptime("17:00", "%H:%M").time()),
                    total_work_minutes=480,  # 8 hours
                    leave_type=None,
                )
                db.add(attendance)
                attendance_records.append(attendance)
        
        db.commit()
        print(f"✅ Created {len(attendance_records)} demo attendance records")
    except Exception as e:
        print(f"❌ Error creating demo attendance: {e}")
        db.rollback()
    finally:
        db.close()


def create_demo_salaries(employees):
    """Create demo salary records."""
    if not employees:
        print("⚠️  No employees to create salaries for")
        return
    
    db = SessionLocal()
    try:
        # Check if salary records already exist
        existing = db.query(Salary).count()
        if existing > 0:
            print(f"⚠️  {existing} salary records already exist")
            return
        
        salary_records = []
        current_date = datetime.now()
        month_str = current_date.strftime("%Y-%m")
        
        for employee in employees:
            salary = Salary(
                employee_id=employee.id,
                month=month_str,
                rate_of_pay=50000,
                month_days=30,
                total_days_worked=25,
                amount=50000,
                advance=0,
                net_amount=50000,
                status="approved",
            )
            db.add(salary)
            salary_records.append(salary)
        
        db.commit()
        print(f"✅ Created {len(salary_records)} demo salary records")
    except Exception as e:
        print(f"❌ Error creating demo salaries: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """Create all demo data."""
    print("=" * 60)
    print("Demo Administrator & Sample Data Creation")
    print("=" * 60)
    
    print(f"\n🔧 Configuration:")
    print(f"  Database URL: {settings.DATABASE_URL[:50]}...")
    print(f"  Admin Username: demo_admin")
    
    # Create admin account
    print(f"\n👤 Creating demo administrator...")
    admin = create_demo_admin()
    if not admin:
        print("❌ Failed to create demo admin")
        sys.exit(1)
    
    # Create demo employees
    print(f"\n👥 Creating demo employees...")
    employees = create_demo_employees()
    
    # Create demo attendance
    print(f"\n📋 Creating demo attendance records...")
    create_demo_attendance(employees)
    
    # Create demo salaries
    print(f"\n💰 Creating demo salary records...")
    create_demo_salaries(employees)
    
    print("\n" + "=" * 60)
    print("✅ Demo data creation complete!")
    print("=" * 60)
    print("\nYou can now login with:")
    print("  Username: demo_admin")
    print("  Password: change_me_123")
    print("\n⚠️  IMPORTANT:")
    print("  1. Change the demo admin password after testing")
    print("  2. Delete demo data before production deployment")
    print("  3. Update ADMIN_PASSWORD in .env for your primary admin")


if __name__ == "__main__":
    main()
