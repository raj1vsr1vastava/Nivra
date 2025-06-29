#!/usr/bin/env python3
import psycopg2
import os
import dotenv

# Load environment variables
dotenv.load_dotenv()

# Get database connection string from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable not found.")
    print("Please make sure you have set the DATABASE_URL in your .env file.")
    exit(1)

# Parse DATABASE_URL to get connection parameters
# Format: postgresql://username:password@host:port/database
db_parts = DATABASE_URL.replace("postgresql://", "").split("/")
db_name = db_parts[1]
conn_parts = db_parts[0].split("@")
user = conn_parts[0].split(":")[0] if ":" in conn_parts[0] else conn_parts[0]
password = conn_parts[0].split(":")[1] if ":" in conn_parts[0] else ""
host_port = conn_parts[1].split(":")
host = host_port[0]
port = host_port[1] if len(host_port) > 1 else "5432"

# Connect to the database
try:
    conn = psycopg2.connect(
        dbname=db_name,
        user=user,
        password=password,
        host=host,
        port=port
    )
    
    # Create cursor
    cursor = conn.cursor()
    
    # Get column names from resident_finances table
    cursor.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'resident_finances'
    """)
    
    columns = [row[0] for row in cursor.fetchall()]
    print("Columns in resident_finances table:", columns)
    
    # Check if is_active column exists
    if "is_active" in columns:
        print("is_active column exists in the resident_finances table")
    else:
        print("is_active column DOES NOT exist in the resident_finances table")
        
        # Add the is_active column if it doesn't exist
        add_column = input("Do you want to add the is_active column to the table? (y/n): ")
        if add_column.lower() == "y":
            try:
                cursor.execute("""
                    ALTER TABLE resident_finances 
                    ADD COLUMN is_active BOOLEAN DEFAULT TRUE
                """)
                conn.commit()
                print("Column 'is_active' added successfully!")
            except Exception as e:
                print(f"Error adding column: {e}")
                conn.rollback()
    
    # Close connection
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
