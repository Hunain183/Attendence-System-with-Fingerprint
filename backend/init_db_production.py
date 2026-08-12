"""
Production Database Initialization Script

This script initializes a production PostgreSQL database with all required tables.
Run this ONCE when setting up a new production environment.

Usage:
    python init_db_production.py

Environment Variables Required:
    DATABASE_URL: PostgreSQL connection string
                  Format: postgresql+asyncpg://user:password@host:port/dbname

The script will:
    1. Connect to the PostgreSQL database
    2. Create all required tables based on SQLAlchemy models
    3. Verify the schema is correct
    4. Report success or errors
"""

import os
import sys
from sqlalchemy import inspect

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base, init_db
from utils.config import settings


def verify_database_connection():
    """Verify that the database connection works."""
    try:
        with engine.connect() as connection:
            print("✅ Database connection successful")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


def verify_tables_created():
    """Verify that all required tables exist."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    required_tables = {'users', 'employees', 'attendance', 'salaries'}
    existing_tables = set(tables)
    
    print("\n📋 Tables Status:")
    for table in required_tables:
        status = "✅" if table in existing_tables else "❌"
        print(f"  {status} {table}")
    
    missing_tables = required_tables - existing_tables
    if missing_tables:
        print(f"\n❌ Missing tables: {', '.join(missing_tables)}")
        return False
    
    print("\n✅ All required tables exist")
    return True


def main():
    """Initialize the production database."""
    print("=" * 60)
    print("Production Database Initialization")
    print("=" * 60)
    
    # Display configuration
    print(f"\n🔧 Configuration:")
    print(f"  Database URL: {settings.DATABASE_URL[:50]}...")
    print(f"  Environment: {settings.ENVIRONMENT}")
    
    # Verify connection
    print(f"\n🔗 Connecting to database...")
    if not verify_database_connection():
        print("\n❌ Failed to connect to database. Please check DATABASE_URL.")
        sys.exit(1)
    
    # Initialize database (create tables)
    print(f"\n📦 Creating database tables...")
    try:
        init_db()
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        sys.exit(1)
    
    # Verify tables were created
    print(f"\n✓ Verifying tables...")
    if not verify_tables_created():
        print("\n❌ Some tables are missing. Database initialization may have failed.")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ Database initialization complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Create the first admin account:")
    print("     python create_demo_admin.py")
    print("  2. Test the API: http://localhost:8000/health")
    print("  3. Access API docs: http://localhost:8000/docs")


if __name__ == "__main__":
    main()
