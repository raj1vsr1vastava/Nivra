#!/usr/bin/env python3
from sqlalchemy import create_engine, text
from prettytable import PrettyTable
import os
import dotenv
import sys

# Load environment variables
dotenv.load_dotenv()

# Get database connection string from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable not found.")
    print("Please make sure you have set the DATABASE_URL in your .env file.")
    sys.exit(1)

try:
    # Create SQLAlchemy engine
    engine = create_engine(DATABASE_URL)

    # Connect to the database
    with engine.connect() as connection:
        # Query to get resident finances data
        query = text('''
            SELECT 
                rf.id, 
                r.first_name || ' ' || r.last_name as resident_name, 
                r.unit_number,
                s.name as society_name,
                rf.transaction_type, 
                rf.amount, 
                rf.currency,
                rf.due_date, 
                rf.payment_date, 
                rf.payment_method, 
                rf.payment_status,
                rf.description,
                rf.invoice_number,
                rf.receipt_number,
                true as is_active, -- Assuming all records are active since there's no is_active column
                rf.created_at
            FROM resident_finances rf
            JOIN residents r ON rf.resident_id = r.id
            JOIN societies s ON r.society_id = s.id
            ORDER BY rf.created_at DESC
        ''')
        
        result = connection.execute(query)
        rows = result.fetchall()
        
        if not rows:
            print("No resident finance records found in the database.")
            sys.exit(0)
        
        # Create a pretty table for display
        table = PrettyTable()
        table.field_names = [
            "ID", "Resident Name", "Unit", "Society", "Type", "Amount", "Currency",
            "Due Date", "Payment Date", "Method", "Status", "Description", 
            "Invoice #", "Receipt #", "Active", "Created At"
        ]
        
        # Make the table fit in the terminal - adjust for better display
        table.max_width = 120
        # Set horizontal and vertical rules for better readability
        try:
            # For newer prettytable versions
            from prettytable.prettytable import FRAME, HEADER, ALL
            table.hrules = ALL
        except (ImportError, TypeError):
            # Fallback to older approach
            pass
        # Set column alignment for better readability
        table.align["ID"] = "l"
        table.align["Resident Name"] = "l"
        table.align["Unit"] = "c"
        table.align["Society"] = "l"
        table.align["Type"] = "l"
        table.align["Amount"] = "r"
        table.align["Currency"] = "c"
        table.align["Due Date"] = "c"
        table.align["Payment Date"] = "c"
        table.align["Method"] = "l"
        table.align["Status"] = "c"
        table.align["Description"] = "l"
        # Limit the number of rows shown to avoid overwhelming output
        max_rows_to_show = 10
        
        # Add data to the table
        for i, row in enumerate(rows):
            if i >= max_rows_to_show:
                break
                
            # Format dates for better display
            due_date = row[7].strftime('%Y-%m-%d') if row[7] else "N/A"
            payment_date = row[8].strftime('%Y-%m-%d') if row[8] else "N/A"
            created_at = row[15].strftime('%Y-%m-%d %H:%M') if row[15] else "N/A"
            
            # Truncate description if too long
            description = row[11]
            if description and len(description) > 30:
                description = description[:27] + "..."
                
            table.add_row([
                str(row[0])[:8] + "...",  # Truncate UUID
                row[1],
                row[2],
                row[3],
                row[4],
                row[5],
                row[6],
                due_date,
                payment_date,
                row[9] or "N/A",
                row[10],
                description or "N/A",
                row[12] or "N/A",
                row[13] or "N/A",
                "Yes" if row[14] else "No",
                created_at
            ])
        
        print(f"Resident Finances Data (showing {min(max_rows_to_show, len(rows))} of {len(rows)} records):")
        print(table)
        
        # Print some statistics
        query_stats = text('''
            SELECT 
                COUNT(*) as total_records,
                SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_records,
                SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_records,
                SUM(CASE WHEN payment_status = 'overdue' THEN 1 ELSE 0 END) as overdue_records,
                SUM(amount) as total_amount,
                SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as paid_amount
            FROM resident_finances
        ''')
        
        stats_result = connection.execute(query_stats)
        stats = stats_result.fetchone()
        
        if stats:
            print("\nStatistics:")
            print(f"Total Records: {stats[0]}")
            print(f"Paid Records: {stats[1]}")
            print(f"Pending Records: {stats[2]}")
            print(f"Overdue Records: {stats[3]}")
            print(f"Total Amount: {stats[4]} INR")
            print(f"Paid Amount: {stats[5]} INR")
            print(f"Pending/Overdue Amount: {stats[4] - stats[5]} INR")
        
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
