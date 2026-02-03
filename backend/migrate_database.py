"""
Database migration script to add new employee fields and salary tables.
Run this to update existing database with new columns and tables.
"""
import sqlite3
import os

# Get database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'attendance.db')

def migrate_database():
    """Add new columns to employees table and create salaries table."""
    
    print(f"Migrating database: {DB_PATH}")
    
    if not os.path.exists(DB_PATH):
        print("Database doesn't exist yet. Will be created with new schema on first run.")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # List of new columns to add
    new_columns = [
        ("date_of_birth", "DATETIME"),
        ("reference_1", "VARCHAR(200)"),
        ("reference_2", "VARCHAR(200)"),
        ("reference_address_1", "TEXT"),
        ("reference_address_2", "TEXT"),
        ("shift", "VARCHAR(1)"),
        ("hod", "VARCHAR(100)"),
        ("sub_department", "VARCHAR(100)"),
        ("rest_day", "VARCHAR(50)"),
        ("quit_date", "DATETIME"),
        ("remarks", "TEXT"),
        ("monthly_salary", "INTEGER"),
        ("rate_per_day", "INTEGER"),
        ("previous_employer", "VARCHAR(200)"),
        ("previous_employer_address", "TEXT"),
        ("previous_designation", "VARCHAR(100)"),
        ("previous_period_of_service", "VARCHAR(200)"),
    ]
    
    # Get existing columns
    cursor.execute("PRAGMA table_info(employees)")
    existing_columns = {row[1] for row in cursor.fetchall()}
    
    # Add new columns if they don't exist
    for column_name, column_type in new_columns:
        if column_name not in existing_columns:
            try:
                sql = f"ALTER TABLE employees ADD COLUMN {column_name} {column_type}"
                print(f"Adding column: {column_name}")
                cursor.execute(sql)
                conn.commit()
                print(f"✓ Added {column_name}")
            except sqlite3.Error as e:
                print(f"✗ Error adding {column_name}: {e}")
        else:
            print(f"○ Column {column_name} already exists")

    # Create salaries table if it doesn't exist
    print("\nEnsuring salaries table exists...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS salaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        month VARCHAR(7) NOT NULL,
        rate_of_pay REAL NOT NULL,
        month_days INTEGER DEFAULT 30,
        overtime_hours REAL DEFAULT 0.0,
        total_days_worked INTEGER DEFAULT 0,
        amount REAL DEFAULT 0.0,
        advance REAL DEFAULT 0.0,
        net_amount REAL DEFAULT 0.0,
        notes TEXT,
        signature TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_salaries_employee_id ON salaries(employee_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_salaries_month ON salaries(month)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_salaries_status ON salaries(status)")
    conn.commit()
    print("✓ Salaries table ready")
    
    conn.close()
    print("\nMigration complete!")

if __name__ == "__main__":
    migrate_database()
