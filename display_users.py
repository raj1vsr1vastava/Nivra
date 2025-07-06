#!/usr/bin/env python3
"""
Query users table data from the Nivra database
"""
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add the current directory to the Python path
sys.path.append('/Users/srivastavar/Documents/Rajiv/workspace/Nivra/api')

# Load environment variables
load_dotenv('/Users/srivastavar/Documents/Rajiv/workspace/Nivra/api/.env')

# Get database URL from environment variable or use default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://srivastavar@localhost:5432/nivra")

def display_users_table():
    """Display all data from the users table"""
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Query users table
        query = """
        SELECT 
            u.id,
            u.username,
            u.email,
            u.full_name,
            r.name as role_name,
            u.is_active,
            u.last_login,
            u.created_at,
            u.updated_at
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        ORDER BY u.created_at DESC;
        """
        
        with engine.connect() as conn:
            result = conn.execute(text(query))
            rows = result.fetchall()
            
            if rows:
                print("=== USERS TABLE DATA ===")
                print(f"Total users: {len(rows)}")
                print("\n" + "="*120)
                
                # Print header
                headers = ['ID', 'Username', 'Email', 'Full Name', 'Role', 'Active', 'Last Login', 'Created At', 'Updated At']
                print(f"{'ID':<36} {'Username':<20} {'Email':<30} {'Full Name':<25} {'Role':<15} {'Active':<8} {'Last Login':<20} {'Created At':<20}")
                print("-" * 120)
                
                # Print data rows
                for row in rows:
                    print(f"{str(row[0]):<36} {str(row[1]):<20} {str(row[2]):<30} {str(row[3]):<25} {str(row[4] or 'N/A'):<15} {str(row[5]):<8} {str(row[6] or 'Never'):<20} {str(row[7]):<20}")
                
            else:
                print("No users found in the database.")
                
    except Exception as e:
        print(f"Error querying users table: {e}")
        
        # Try to check if table exists
        try:
            engine = create_engine(DATABASE_URL)
            with engine.connect() as conn:
                result = conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users';"))
                table_exists = result.fetchone()
                
                if not table_exists:
                    print("The 'users' table does not exist. You may need to run the database creation script first.")
                else:
                    print("The 'users' table exists but there was an error querying it.")
                    
        except Exception as inner_e:
            print(f"Error checking table existence: {inner_e}")

if __name__ == "__main__":
    display_users_table()
