"""
Database migration script to add new employee fields.
Run this to update existing database with new columns.
"""
import sqlite3
import os

# Get database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'attendance.db')

def migrate_database():
    """Add new columns to employees table."""
    
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
    
    conn.close()
    print("\nMigration complete!")

if __name__ == "__main__":
    migrate_database()
