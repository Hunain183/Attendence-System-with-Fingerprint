"""
Database configuration and session management.
Uses SQLAlchemy with SQLite database.
"""
import os
import sqlite3

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

from utils.config import settings

# Create SQLAlchemy engine
# Using StaticPool for SQLite to handle concurrent connections
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite
    poolclass=StaticPool,
    echo=False  # Set to True for SQL query logging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()


def get_db():
    """
    Dependency that provides a database session.
    Ensures proper cleanup after each request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.
    Called on application startup.
    """
    from models import employee, attendance, user, salary  # Import models to register them
    Base.metadata.create_all(bind=engine)
    ensure_db_schema()


def ensure_db_schema():
    """
    Ensure existing SQLite databases are updated with new columns.
    This keeps older databases compatible without data loss.
    """
    db_path = _get_sqlite_db_path()
    if not db_path or not os.path.exists(db_path):
        return

    conn = sqlite3.connect(db_path)
    try:
        schema = _expected_schema()
        for table_name, columns in schema.items():
            if not _table_exists(conn, table_name):
                continue
            existing = _get_columns(conn, table_name)
            for column_name, column_spec in columns.items():
                if column_name in existing:
                    continue
                sql = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_spec}"
                conn.execute(sql)
            conn.commit()
    finally:
        conn.close()


def _get_sqlite_db_path() -> str | None:
    """
    Resolve the SQLite file path from the SQLAlchemy engine.
    Returns None for non-file-based SQLite databases.
    """
    if engine.url.drivername != "sqlite":
        return None
    db_path = engine.url.database
    if not db_path or db_path == ":memory:":
        return None
    return os.path.abspath(db_path)


def _table_exists(conn: sqlite3.Connection, table_name: str) -> bool:
    cursor = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table_name,)
    )
    return cursor.fetchone() is not None


def _get_columns(conn: sqlite3.Connection, table_name: str) -> set[str]:
    cursor = conn.execute(f"PRAGMA table_info({table_name})")
    return {row[1] for row in cursor.fetchall()}


def _expected_schema() -> dict[str, dict[str, str]]:
    """
    Map of tables to column definitions used for auto-migration.
    Column definitions must be valid SQLite column specs.
    """
    return {
        "employees": {
            "father_name": "VARCHAR(100)",
            "date_of_birth": "DATETIME",
            "cnic": "VARCHAR(15)",
            "phone_number": "VARCHAR(20)",
            "permanent_address": "TEXT",
            "current_address": "TEXT",
            "reference_1": "VARCHAR(200)",
            "reference_2": "VARCHAR(200)",
            "reference_address_1": "TEXT",
            "reference_address_2": "TEXT",
            "employment_type": "VARCHAR(50)",
            "designation": "VARCHAR(100)",
            "department": "VARCHAR(100)",
            "hod": "VARCHAR(100)",
            "sub_department": "VARCHAR(100)",
            "date_of_joining": "DATETIME",
            "shift": "VARCHAR(1)",
            "rest_day": "VARCHAR(50)",
            "quit_date": "DATETIME",
            "remarks": "TEXT",
            "monthly_salary": "INTEGER",
            "rate_per_day": "INTEGER",
            "increment": "INTEGER",
            "date_of_increment": "DATETIME",
            "total_salary": "INTEGER",
            "previous_employer": "VARCHAR(200)",
            "previous_employer_address": "TEXT",
            "previous_designation": "VARCHAR(100)",
            "previous_period_of_service": "VARCHAR(200)",
            "fingerprint_template": "TEXT",
            "created_at": "DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL",
            "updated_at": "DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL",
        },
        "attendance": {
            "attendance_date": "DATE",
            "time_in": "TIME",
            "time_out": "TIME",
            "total_work_minutes": "INTEGER DEFAULT 0",
            "overtime": "BOOLEAN DEFAULT 0",
            "overtime_minutes": "INTEGER DEFAULT 0",
            "device_id": "VARCHAR(100)",
            "created_at": "DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL",
        },
        "users": {
            "password_hash": "VARCHAR(255)",
            "role": "VARCHAR(50) DEFAULT 'user' NOT NULL",
            "is_active": "BOOLEAN DEFAULT 1 NOT NULL",
            "created_at": "DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL",
            "updated_at": "DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL",
        },
        "salaries": {
            "employee_id": "INTEGER",
            "month": "VARCHAR(7)",
            "rate_of_pay": "REAL",
            "month_days": "INTEGER DEFAULT 30",
            "overtime_hours": "REAL DEFAULT 0.0",
            "total_days_worked": "INTEGER DEFAULT 0",
            "amount": "REAL DEFAULT 0.0",
            "advance": "REAL DEFAULT 0.0",
            "net_amount": "REAL DEFAULT 0.0",
            "notes": "TEXT",
            "signature": "TEXT",
            "status": "VARCHAR(20) DEFAULT 'pending'",
            "created_at": "DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL",
            "updated_at": "DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL",
        },
    }
