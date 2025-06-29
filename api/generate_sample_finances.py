import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
import random
from datetime import datetime, timedelta
import uuid

# Load environment variables
load_dotenv()

# Get database connection string from environment variables
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://srivastavar@localhost:5432/nivra")

# Connect to the database
conn_string = DATABASE_URL
conn = psycopg2.connect(conn_string)
cursor = conn.cursor(cursor_factory=RealDictCursor)

# Function to check if there's already data in resident_finances
def check_resident_finances():
    cursor.execute("SELECT COUNT(*) as count FROM resident_finances")
    result = cursor.fetchone()
    if result:
        return result['count'] > 0
    return False

# Function to fetch all residents
def get_residents():
    cursor.execute("SELECT id, first_name, last_name, unit_number FROM residents WHERE is_active = True")
    return cursor.fetchall()

# Function to generate sample finance data
def generate_sample_finances(residents, num_entries_per_resident=3):
    total_records = 0
    
    if not residents:
        print("No active residents found in the database.")
        return 0
    
    # Transaction types and payment statuses
    transaction_types = ["Maintenance Fee", "Utility Bill", "Parking Fee", "Special Assessment", "Late Fee", "Security Deposit"]
    payment_statuses = ["Paid", "Pending", "Overdue", "Partial"]
    payment_methods = ["Credit Card", "Bank Transfer", "Cash", "Check", "Online Payment"]
    
    # Currency
    currency = "USD"
    
    # Base date for transactions
    now = datetime.now()
    
    for resident in residents:
        resident_id = resident['id']
        
        # Generate random number of entries for this resident
        entries_for_resident = random.randint(1, num_entries_per_resident)
        
        for i in range(entries_for_resident):
            # Generate realistic data
            transaction_type = random.choice(transaction_types)
            
            # Generate amount based on transaction type
            if transaction_type == "Maintenance Fee":
                amount = random.uniform(100, 500)
            elif transaction_type == "Utility Bill":
                amount = random.uniform(50, 200)
            elif transaction_type == "Parking Fee":
                amount = random.uniform(30, 100)
            elif transaction_type == "Special Assessment":
                amount = random.uniform(300, 1000)
            elif transaction_type == "Late Fee":
                amount = random.uniform(10, 50)
            else:  # Security Deposit
                amount = random.uniform(500, 1500)
            
            # Generate due date (between 90 days ago and 90 days in future)
            days_offset = random.randint(-90, 90)
            due_date = now + timedelta(days=days_offset)
            
            # Payment status logic
            if days_offset < -7:  # Past due date by more than a week
                payment_status = random.choices(
                    ["Paid", "Overdue", "Partial"],
                    weights=[0.7, 0.2, 0.1],
                    k=1
                )[0]
            elif days_offset < 0:  # Past due date but less than a week
                payment_status = random.choices(
                    ["Paid", "Overdue", "Pending", "Partial"],
                    weights=[0.5, 0.2, 0.2, 0.1],
                    k=1
                )[0]
            else:  # Future due date
                payment_status = "Pending"
                
            # Payment date logic
            payment_date = None
            if payment_status in ["Paid", "Partial"]:
                # Payment made between 30 days before due date and due date
                payment_days_offset = random.randint(-30, min(0, days_offset))
                payment_date = due_date + timedelta(days=payment_days_offset)
            
            payment_method = random.choice(payment_methods) if payment_status in ["Paid", "Partial"] else None
            
            # Generate unique invoice/receipt numbers
            invoice_number = f"INV-{uuid.uuid4().hex[:8].upper()}"
            receipt_number = f"RCPT-{uuid.uuid4().hex[:8].upper()}" if payment_status in ["Paid", "Partial"] else None
            
            # Description
            description = f"{transaction_type} for {resident['first_name']} {resident['last_name']}, Unit {resident['unit_number']}"
            
            # Insert into database
            cursor.execute("""
                INSERT INTO resident_finances 
                (resident_id, transaction_type, amount, currency, due_date, payment_date, 
                payment_method, payment_status, description, invoice_number, receipt_number, is_active) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                resident_id, transaction_type, amount, currency, due_date, payment_date,
                payment_method, payment_status, description, invoice_number, receipt_number, True
            ))
            
            total_records += 1
    
    # Commit the changes
    conn.commit()
    return total_records

# Main function
if __name__ == "__main__":
    try:
        # Check if data exists
        if check_resident_finances():
            print("The resident_finances table already has data. Skipping sample data generation.")
        else:
            # Fetch residents
            residents = get_residents()
            
            # Generate sample finances
            total_records = generate_sample_finances(residents, num_entries_per_resident=5)
            
            print(f"Successfully generated {total_records} sample finance records for {len(residents)} residents.")
        
    except Exception as e:
        conn.rollback()
        print(f"Error occurred: {e}")
    finally:
        # Close connection
        cursor.close()
        conn.close()
        print("Database connection closed.")
