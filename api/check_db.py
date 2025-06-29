#!/usr/bin/env python3
"""
Script to check the contents of the database tables.
"""

from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv
import os
from pprint import pprint
from tabulate import tabulate

# Load environment variables
load_dotenv()

# Get database URL from environment variable or use default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/nivra")

def check_table(engine, table_name):
    """Check contents of a table."""
    print(f"\n=== Contents of {table_name} table ===")
    try:
        with engine.connect() as connection:
            result = connection.execute(text(f"SELECT * FROM {table_name}"))
            rows = result.fetchall()
            if not rows:
                print(f"No records found in {table_name} table.")
                return []
            
            # Get column names
            columns = result.keys()
            
            # Create a list of dictionaries for better display
            records = []
            for row in rows:
                record = {col: getattr(row, col) for col in columns}
                records.append(record)
            
            # Print using tabulate for better formatting
            table_data = [[record.get(col) for col in columns] for record in records]
            print(tabulate(table_data, headers=columns, tablefmt="grid"))
            
            return records
    except Exception as e:
        print(f"Error accessing {table_name}: {str(e)}")
        return []

def get_all_tables(engine):
    """Get all table names from the database."""
    inspector = inspect(engine)
    return inspector.get_table_names()

def main():
    """Main function."""
    print(f"Connecting to database: {DATABASE_URL}")
    
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    # Get all table names
    tables = get_all_tables(engine)
    print(f"Found {len(tables)} tables in the database: {', '.join(tables)}")
    
    # Check all tables
    table_data = {}
    for table_name in tables:
        records = check_table(engine, table_name)
        table_data[table_name] = len(records)
    
    # Print summary
    print("\n=== Database Summary ===")
    for table_name, count in table_data.items():
        print(f"{table_name}: {count} records")

if __name__ == "__main__":
    main()
