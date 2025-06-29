-- Connect to the Nivra database
\c nivra;

-- Create society_finances table for common amenities and services
CREATE TABLE society_finances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    expense_type VARCHAR(50) NOT NULL, -- regular, adhoc
    category VARCHAR(50) NOT NULL, -- security, housekeeping, gardener, electricity, water, event, etc.
    vendor_name VARCHAR(255),
    expense_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, overdue, partially_paid
    payment_date DATE,
    payment_method VARCHAR(50),
    invoice_number VARCHAR(100),
    receipt_number VARCHAR(100),
    description TEXT,
    recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency VARCHAR(20), -- monthly, quarterly, annually, etc.
    next_due_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger to update updated_at timestamp automatically
CREATE TRIGGER update_society_finances_updated_at
    BEFORE UPDATE ON society_finances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    
-- Create indexes for better performance
CREATE INDEX idx_society_finances_society_id ON society_finances(society_id);
CREATE INDEX idx_society_finances_category ON society_finances(category);
CREATE INDEX idx_society_finances_expense_type ON society_finances(expense_type);
CREATE INDEX idx_society_finances_expense_date ON society_finances(expense_date);
CREATE INDEX idx_society_finances_payment_status ON society_finances(payment_status);
