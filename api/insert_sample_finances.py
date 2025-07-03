#!/usr/bin/env python3
"""
Script to insert sample resident finance data into the database.
"""

import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from datetime import date, datetime, timedelta
import random
import uuid

# Add parent directory to path to import models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import models
from database import engine, Base, get_db

# Load environment variables
load_dotenv()

# Create a session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def insert_sample_resident_finances():
    """
    Insert sample finance data for a resident.
    """
    print("Inserting sample resident finance data...")
    
    # Get a random active resident from the database
    residents = db.query(models.Resident).filter(models.Resident.is_active == True).limit(10).all()
    if not residents:
        print("Error: No active residents found in the database.")
        return
    
    print(f"Found {len(residents)} active residents. Creating finance records for them...")
    
    # Transaction types
    transaction_types = ["maintenance", "penalty", "special_charge", "payment"]
    
    # Payment statuses
    payment_statuses = ["pending", "paid", "overdue"]
    
    # Sample descriptions for different transaction types
    descriptions = {
        "maintenance": ["Monthly Maintenance", "Quarterly Maintenance", "Annual Maintenance"],
        "penalty": ["Late Payment Penalty", "Rule Violation Penalty"],
        "special_charge": ["Festival Decoration", "Security Upgrade", "Common Area Renovation", "Water Tank Cleaning"],
        "payment": ["Maintenance Payment", "Dues Settlement", "Penalty Payment"]
    }
    
    # For each resident, create some finance records
    for resident in residents:
        print(f"Creating finance records for resident: {resident.first_name} {resident.last_name} (ID: {resident.id})")
        
        # Create 3-7 finance records per resident
        num_records = random.randint(3, 7)
        
        for i in range(num_records):
            # Randomly select transaction type
            transaction_type = random.choice(transaction_types)
            
            # Set payment status based on transaction type
            if transaction_type == "payment":
                payment_status = "paid"
            else:
                payment_status = random.choice(payment_statuses)
            
            # Set dates
            today = date.today()
            days_ago = random.randint(0, 90)  # Random date within the last 90 days
            transaction_date = today - timedelta(days=days_ago)
            
            payment_date = None
            if payment_status == "paid":
                days_after = random.randint(0, 15)  # Paid within 15 days
                payment_date = transaction_date + timedelta(days=days_after)
                if payment_date > today:
                    payment_date = today
            
            # Set amount (between 1000 and 10000)
            amount = round(random.uniform(1000, 10000), 2)
            
            # Set description
            description = random.choice(descriptions.get(transaction_type, ["Transaction"]))
            
            # Create finance record
            finance_record = models.ResidentFinance(
                id=uuid.uuid4(),
                resident_id=resident.id,
                transaction_type=transaction_type,
                amount=amount,
                currency="INR",
                due_date=transaction_date,
                payment_date=payment_date,
                payment_method="online" if payment_status == "paid" else None,
                payment_status=payment_status,
                description=description,
                invoice_number=f"INV-{random.randint(10000, 99999)}" if transaction_type != "payment" else None,
                receipt_number=f"RCPT-{random.randint(10000, 99999)}" if payment_status == "paid" else None,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(finance_record)
            print(f"  Added {transaction_type} record: {description}, Amount: ₹{amount}, Status: {payment_status}")            # Create at least one 'payment' record if none exists
        if not any(r.transaction_type == "payment" for r in db.query(models.ResidentFinance).filter_by(resident_id=resident.id).all()):
            payment_amount = round(random.uniform(3000, 8000), 2)
            current_date = date.today()
            payment_record = models.ResidentFinance(
                id=uuid.uuid4(),
                resident_id=resident.id,
                transaction_type="payment",
                amount=payment_amount,
                currency="INR",
                due_date=current_date - timedelta(days=random.randint(10, 30)),
                payment_date=current_date - timedelta(days=random.randint(0, 9)),
                payment_method="online",
                payment_status="paid",
                description="Maintenance Payment",
                invoice_number=None,
                receipt_number=f"RCPT-{random.randint(10000, 99999)}",
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(payment_record)
            print(f"  Added payment record: Maintenance Payment, Amount: ₹{payment_amount}, Status: paid")
    
    # Commit the changes
    try:
        db.commit()
        print("Sample resident finance data inserted successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error inserting sample data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    insert_sample_resident_finances()
    print("Done. Check the database for the new records.")
