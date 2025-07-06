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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Sandhya',
    'Sathish',
    'sandhya@sathish.com',
    '1918334414',
    'A-01',
    TRUE,
    FALSE,
    NULL,
    '2017-04-01',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Vidya',
    'Singh',
    'vidya@singh.com',
    '1426862461',
    'A-02',
    TRUE,
    FALSE,
    NULL,
    '2017-04-02',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Almas',
    'Zaidi',
    'almas@zaidi.com',
    '5610142338',
    'A-03',
    TRUE,
    FALSE,
    NULL,
    '2017-04-03',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Saurabh',
    'Saurabh',
    'saurabh@saurabh.com',
    '80186692',
    'A-04',
    TRUE,
    FALSE,
    NULL,
    '2017-04-04',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Pratap',
    'Reddy',
    'pratap@reddy.com',
    '379763869',
    'A-05',
    FALSE,
    FALSE,
    NULL,
    '2017-04-05',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Naveen',
    'Reddy',
    'naveen@reddy.com',
    '9985186736',
    'A-06',
    TRUE,
    TRUE,
    'Secretary',
    '2017-04-06',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Pradeep',
    'Pradeep',
    'pradeep@pradeep.com',
    '6932095553',
    'A-07',
    TRUE,
    FALSE,
    NULL,
    '2017-04-07',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'SHASHANK',
    'SHASHANK',
    'shashank@shashank.com',
    '9063899258',
    'A-08',
    FALSE,
    FALSE,
    NULL,
    '2017-04-08',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Chandrashekaran',
    'Vamsee',
    'chandrashekaran@vamsee.com',
    '893648150',
    'A-09',
    FALSE,
    FALSE,
    NULL,
    '2017-04-09',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'CV',
    'Subramanniyam',
    'c@subramanniyam.com',
    '9519113763',
    'A-10',
    TRUE,
    FALSE,
    NULL,
    '2017-04-10',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'CV',
    'Subramanniyam',
    'c@subramanniyam.com',
    '6201949903',
    'A-11',
    FALSE,
    FALSE,
    NULL,
    '2017-04-11',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Shanu',
    'Saha',
    'shanu@saha.com',
    '5921177130',
    'A-12',
    TRUE,
    FALSE,
    NULL,
    '2017-04-12',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Tanjamma',
    'Tanjamma',
    'tanjamma@tanjamma.com',
    '996746332',
    'A-13',
    FALSE,
    FALSE,
    NULL,
    '2017-04-13',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'SHASHANK',
    'SHASHANK',
    'shashank@shashank.com',
    '3819316142',
    'A-14',
    FALSE,
    FALSE,
    NULL,
    '2017-04-14',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'SHASHANK',
    'SHASHANK',
    'shashank@shashank.com',
    '1826096416',
    'A-15',
    FALSE,
    FALSE,
    NULL,
    '2017-04-15',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Suchit',
    'Prasanna',
    'suchit@prasanna.com',
    '6327002766',
    'A-16',
    TRUE,
    FALSE,
    NULL,
    '2017-04-16',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Pratyush',
    'Dutta',
    'pratyush@dutta.com',
    '5824530274',
    'A-17',
    TRUE,
    FALSE,
    NULL,
    '2017-04-17',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'SHASHANK',
    'SHASHANK',
    'shashank@shashank.com',
    '231819926',
    'A-18',
    FALSE,
    FALSE,
    NULL,
    '2017-04-18',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Sudeep',
    'Singh',
    'sudeep@singh.com',
    '6143298055',
    'A-19',
    FALSE,
    FALSE,
    NULL,
    '2017-04-19',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Susanta',
    'Sahoo',
    'susanta@sahoo.com',
    '9261129064',
    'A-20',
    FALSE,
    FALSE,
    NULL,
    '2017-04-20',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Santosh',
    'Kumar',
    'santosh@kumar.com',
    '4848278112',
    'A-21',
    TRUE,
    FALSE,
    NULL,
    '2017-04-21',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Tanjamma',
    'Tanjamma',
    'tanjamma@tanjamma.com',
    '6414003653',
    'B-01',
    FALSE,
    FALSE,
    NULL,
    '2017-04-22',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Chandrashekaran',
    'Vamsee',
    'chandrashekaran@vamsee.com',
    '4524131814',
    'B-02',
    FALSE,
    FALSE,
    NULL,
    '2017-04-23',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Ritesh',
    'Dubey',
    'ritesh@dubey.com',
    '1057248642',
    'B-03',
    TRUE,
    FALSE,
    NULL,
    '2017-04-24',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Shinoj',
    'Prabhakaran',
    'shinoj@prabhakaran.com',
    '7751945869',
    'B-04',
    TRUE,
    FALSE,
    NULL,
    '2017-04-25',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Tanjamma',
    'Tanjamma',
    'tanjamma@tanjamma.com',
    '2385229786',
    'B-05',
    FALSE,
    FALSE,
    NULL,
    '2017-04-26',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Navneet',
    'Sinha',
    'navneet@sinha.com',
    '873209194',
    'B-06',
    TRUE,
    FALSE,
    NULL,
    '2017-04-27',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'SHASHANK',
    'SHASHANK',
    'shashank@shashank.com',
    '2638240721',
    'B-07',
    FALSE,
    FALSE,
    NULL,
    '2017-04-28',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Shalini',
    'Sinha',
    'shalini@sinha.com',
    '714784188',
    'B-08',
    FALSE,
    FALSE,
    NULL,
    '2017-04-29',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Rajiv',
    'Srivastava',
    'rajiv@srivastava.com',
    '3111474323',
    'B-09',
    TRUE,
    FALSE,
    NULL,
    '2017-04-30',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Avishek',
    'Saha',
    'avishek@saha.com',
    '3302518060',
    'B-10',
    TRUE,
    FALSE,
    NULL,
    '2017-05-01',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Navneet',
    'Nischal',
    'navneet@nischal.com',
    '2106144517',
    'B-11',
    TRUE,
    FALSE,
    NULL,
    '2017-05-02',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Srinivas',
    'Reddy',
    'srinivas@reddy.com',
    '9338883107',
    'B-12',
    FALSE,
    FALSE,
    NULL,
    '2017-05-03',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Achal',
    'Sinha',
    'achal@sinha.com',
    '7325572304',
    'B-13',
    TRUE,
    FALSE,
    NULL,
    '2017-05-04',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Ujjwal',
    'Sinha',
    'ujjwal@sinha.com',
    '3182995999',
    'B-14',
    FALSE,
    FALSE,
    NULL,
    '2017-05-05',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Anand',
    'Khedkar',
    'anand@khedkar.com',
    '7424266275',
    'B-15',
    FALSE,
    FALSE,
    NULL,
    '2017-05-06',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Vertika',
    'Verma',
    'vertika@verma.com',
    '9044409874',
    'C-01',
    TRUE,
    FALSE,
    NULL,
    '2017-05-07',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Yogi',
    'Singh',
    'sushma@singh.com',
    '1750707882',
    'C-02',
    TRUE,
    TRUE,
    'President',
    '2017-05-08',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Ashish',
    'Anand',
    'ashish@anand.com',
    '2593248971',
    'C-03',
    TRUE,
    FALSE,
    NULL,
    '2017-05-09',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Dhruv',
    'Chadha',
    'dhruv@chadha.com',
    '2368210396',
    'C-04',
    FALSE,
    FALSE,
    NULL,
    '2017-05-10',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Himanshu',
    'Varshney',
    'himanshu@varshney.com',
    '124442835',
    'C-05',
    TRUE,
    FALSE,
    NULL,
    '2017-05-11',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Ashwani',
    'Gupta',
    'ashwani@gupta.com',
    '6500313756',
    'C-06',
    TRUE,
    FALSE,
    NULL,
    '2017-05-12',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Sandeep',
    'Singh',
    'sandeep@singh.com',
    '3572662775',
    'C-07',
    FALSE,
    FALSE,
    NULL,
    '2017-05-13',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Sripathi',
    'Krishnan',
    'sripathi@krishnan.com',
    '6325706640',
    'C-08',
    FALSE,
    FALSE,
    NULL,
    '2017-05-14',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Dr.',
    'Swamy',
    'dr@swamy.com',
    '2368210396',
    'C-09',
    FALSE,
    FALSE,
    NULL,
    '2017-05-15',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Anshuman',
    'Singh',
    'anshuman@singh.com',
    '124442835',
    'C-10',
    TRUE,
    FALSE,
    NULL,
    '2017-05-16',
    NULL,
    TRUE
);

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
    move_out_date,
    is_active
) 
VALUES (
    (SELECT id FROM societies WHERE name = 'Natura'),
    'Tanjamma',
    'Tanjamma',
    'tanjamma@tanjamma.com',
    '6500313756',
    'C-11',
    FALSE,
    FALSE,
    NULL,
    '2017-05-17',
    NULL,
    TRUE
);