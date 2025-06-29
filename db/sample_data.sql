-- Connect to the Nivra database
\c nivra;

-- Insert sample society data
INSERT INTO societies (
    name, 
    address, 
    city, 
    state, 
    zipcode, 
    country, 
    contact_email, 
    contact_phone, 
    registration_number, 
    registration_date, 
    total_units,
    is_active
) VALUES 
(
    'Natura',
    'Chambenahalli, Sarjapura Road',
    'Bangalore',
    'Karnataka',
    '562125',
    'India',
    'contact@natura.com',
    '9876543210',
    'GVA-12345-2020',
    '2020-04-15',
    47,
    TRUE
);

-- Insert sample resident data
INSERT INTO residents (
    society_id,
    first_name,
    last_name,
    email,
    phone,
    unit_number,
    is_owner,
    is_committee_member,
    committee_role,
    move_in_date,
    is_active
) 
VALUES
(
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Rajiv',
    'Srivastava',
    'rajiv.srivastava@example.com',
    '9876543211',
    'B09',
    TRUE,
    TRUE,
    'Secretary',
    '2021-01-15',
    TRUE
),
(
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Ekta',
    'Rathi',
    'ekta.rathi@example.com',
    '9876543222',
    'B09',
    TRUE,
    FALSE,
    NULL,
    '2021-03-10',
    TRUE
),
(
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Reyansh',
    'srivastava',
    'reyansh.srivastava@example.com',
    '9988776677',
    'B09',
    TRUE,
    TRUE,
    'President',
    '2019-05-20',
    TRUE
);

-- Insert sample finance transactions
INSERT INTO resident_finances (
    resident_id,
    transaction_type,
    amount,
    currency,
    due_date,
    payment_date,
    payment_method,
    payment_status,
    description,
    is_active
)
VALUES
(
    (SELECT id FROM residents WHERE email = 'rajiv.srivastava@example.com'),
    'maintenance',
    5000.00,
    'INR',
    '2023-01-15',
    '2023-01-10',
    'UPI',
    'paid',
    'Monthly maintenance for January 2023',
    TRUE
),
(
    (SELECT id FROM residents WHERE email = 'ekta.rathi@example.com'),
    'maintenance',
    5000.00,
    'INR',
    '2023-01-15',
    NULL,
    NULL,
    'pending',
    'Monthly maintenance for January 2023',
    TRUE
),
(
    (SELECT id FROM residents WHERE email = 'reyansh.srivastava@example.com'),
    'special_charge',
    15000.00,
    'INR',
    '2023-02-28',
    '2023-02-25',
    'Bank Transfer',
    'paid',
    'Building painting and repairs',
    TRUE
);
