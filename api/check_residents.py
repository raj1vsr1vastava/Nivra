from sqlalchemy import create_engine, inspect
import json
import os
from dotenv import load_dotenv
from models import Resident, Society
from database import SessionLocal, engine

# Load environment variables
load_dotenv()

def check_database():
    print("Checking database configuration...")
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/nivra")
    print(f"Database URL: {db_url}")
    
    # Check if tables exist
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables in database: {tables}")
    
    if 'residents' not in tables:
        print("Residents table does not exist!")
        return
    
    # Check resident table structure
    columns = inspector.get_columns('residents')
    print("\nColumns in residents table:")
    for column in columns:
        print(f"- {column['name']} ({column['type']})")
    
    db = None
    try:
        # Check for data in the table
        db = SessionLocal()
        
        # Check societies
        societies = db.query(Society).all()
        print(f"\nNumber of societies: {len(societies)}")
        if societies:
            for s in societies[:3]:  # Show only first 3
                print(f"- {s.name} (ID: {s.id})")
            if len(societies) > 3:
                print(f"... and {len(societies) - 3} more")
        
        # Check residents
        resident_count = db.query(Resident).count()
        print(f"\nNumber of residents: {resident_count}")
        
        residents = db.query(Resident).limit(3).all()
        print("\nSample residents:")
        for resident in residents:
            print(f"- ID: {resident.id}")
            print(f"  Name: {resident.first_name} {resident.last_name}")
            print(f"  Email: {resident.email}")
            print(f"  Unit: {resident.unit_number}")
            print(f"  Society ID: {resident.society_id}")
            print("  ----")
            
        # Try a specific query that fails
        print("\nTrying the exact query from the API endpoint:")
        test_residents = db.query(Resident).all()
        print(f"Query successful, returned {len(test_residents)} residents")
        
    except Exception as e:
        print(f"\nError accessing database: {str(e)}")
    finally:
        if db:
            db.close()

if __name__ == "__main__":
    check_database()
