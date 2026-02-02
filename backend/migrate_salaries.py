"""
Database migration script to add salaries table.
Run this script to update existing databases with the new salaries table.
"""
import sqlite3
import os
import sys

# Get the database path
if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DB_PATH = os.path.join(BASE_DIR, 'attendance.db')

print(f"Migrating database: {DB_PATH}\n")

# Connect to database
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Create salaries table if it doesn't exist
print("Creating salaries table...")
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

# Create indexes
cursor.execute("""
CREATE INDEX IF NOT EXISTS idx_salaries_employee_id ON salaries(employee_id)
""")

cursor.execute("""
CREATE INDEX IF NOT EXISTS idx_salaries_month ON salaries(month)
""")

cursor.execute("""
CREATE INDEX IF NOT EXISTS idx_salaries_status ON salaries(status)
""")

# Commit changes
conn.commit()
conn.close()

print("✓ Salaries table created successfully")
print("\nMigration complete!")
