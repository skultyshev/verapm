DO $$
DECLARE
  v_user_id  UUID := 'cdafd168-4cb7-4339-9012-8e83f3831d7d';
  v_org_id   UUID;
  v_p1 UUID; v_p2 UUID; v_p3 UUID; v_p4 UUID;
  v_u1 UUID; v_u2 UUID; v_u4 UUID;
  v_u5 UUID; v_u6 UUID;
  v_u8 UUID; v_u9 UUID;
  v_u11 UUID; v_u12 UUID;
  v_t1 UUID; v_t2 UUID; v_t3 UUID; v_t4 UUID; v_t5 UUID;
  v_t6 UUID; v_t7 UUID; v_t8 UUID; v_t9 UUID;
  v_l1 UUID; v_l2 UUID; v_l3 UUID; v_l4 UUID; v_l5 UUID;
  v_l6 UUID; v_l7 UUID; v_l8 UUID; v_l9 UUID;
BEGIN

SELECT id INTO v_org_id FROM organizations WHERE owner_id = v_user_id LIMIT 1;
IF v_org_id IS NULL THEN
  RAISE EXCEPTION 'No organization found for user %.', v_user_id;
END IF;

INSERT INTO properties (id, org_id, name, address, city, state, zip, type, total_units, year_built, purchase_price)
VALUES
  (uuid_generate_v4(), v_org_id, 'Sunset Apartments',  '2301 Biscayne Blvd', 'Miami',        'FL', '33137', 'residential', 4, 2008, 1200000),
  (uuid_generate_v4(), v_org_id, 'Coral Gables Plaza', '450 Miracle Mile',   'Coral Gables', 'FL', '33134', 'commercial',  3, 1995, 2100000),
  (uuid_generate_v4(), v_org_id, 'Brickell Heights',   '1100 SW 2nd Ave',    'Miami',        'FL', '33130', 'residential', 3, 2015,  980000),
  (uuid_generate_v4(), v_org_id, 'Wynwood Lofts',      '250 NW 23rd St',     'Miami',        'FL', '33127', 'mixed_use',   2, 2019,  750000);

SELECT id INTO v_p1 FROM properties WHERE org_id = v_org_id AND name = 'Sunset Apartments';
SELECT id INTO v_p2 FROM properties WHERE org_id = v_org_id AND name = 'Coral Gables Plaza';
SELECT id INTO v_p3 FROM properties WHERE org_id = v_org_id AND name = 'Brickell Heights';
SELECT id INTO v_p4 FROM properties WHERE org_id = v_org_id AND name = 'Wynwood Lofts';

INSERT INTO units (id, property_id, unit_number, bedrooms, bathrooms, sq_ft, rent_amount, deposit_amount, status)
VALUES
  (uuid_generate_v4(), v_p1, '101', 2, 1,  850, 1800, 1800, 'occupied'),
  (uuid_generate_v4(), v_p1, '102', 1, 1,  650, 1400, 1400, 'occupied'),
  (uuid_generate_v4(), v_p1, '201', 2, 2,  950, 2100, 2100, 'vacant'),
  (uuid_generate_v4(), v_p1, '202', 3, 2, 1100, 2600, 5200, 'occupied'),
  (uuid_generate_v4(), v_p2, 'A',   0, 1,  400, 1200, 2400, 'occupied'),
  (uuid_generate_v4(), v_p2, 'B',   1, 1,  600, 1600, 1600, 'occupied'),
  (uuid_generate_v4(), v_p2, 'C',   2, 1,  800, 1900, 1900, 'vacant'),
  (uuid_generate_v4(), v_p3, '301', 1, 1,  720, 1500, 1500, 'occupied'),
  (uuid_generate_v4(), v_p3, '302', 2, 2, 1050, 2200, 4400, 'occupied'),
  (uuid_generate_v4(), v_p3, '303', 2, 1,  900, 1950, 1950, 'vacant'),
  (uuid_generate_v4(), v_p4, 'L1',  2, 2, 1200, 2800, 5600, 'occupied'),
  (uuid_generate_v4(), v_p4, 'L2',  3, 2, 1400, 3200, 6400, 'occupied');

SELECT id INTO v_u1  FROM units WHERE property_id = v_p1 AND unit_number = '101';
SELECT id INTO v_u2  FROM units WHERE property_id = v_p1 AND unit_number = '102';
SELECT id INTO v_u4  FROM units WHERE property_id = v_p1 AND unit_number = '202';
SELECT id INTO v_u5  FROM units WHERE property_id = v_p2 AND unit_number = 'A';
SELECT id INTO v_u6  FROM units WHERE property_id = v_p2 AND unit_number = 'B';
SELECT id INTO v_u8  FROM units WHERE property_id = v_p3 AND unit_number = '301';
SELECT id INTO v_u9  FROM units WHERE property_id = v_p3 AND unit_number = '302';
SELECT id INTO v_u11 FROM units WHERE property_id = v_p4 AND unit_number = 'L1';
SELECT id INTO v_u12 FROM units WHERE property_id = v_p4 AND unit_number = 'L2';

INSERT INTO tenants (id, org_id, first_name, last_name, email, phone, employer, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, pets, notes)
VALUES
  (uuid_generate_v4(), v_org_id, 'Maria',    'Santos',   'maria.santos@gmail.com', '(305)555-0101', 'Baptist Health',       'Carlos Santos',   '(305)555-0201', 'Brother', 'none', 'Always pays on time.'),
  (uuid_generate_v4(), v_org_id, 'David',    'Chen',     'd.chen@outlook.com',     '(786)555-0102', 'Miami Dade College',   'Lin Chen',        '(786)555-0202', 'Mother',  'cat',  'Has one cat.'),
  (uuid_generate_v4(), v_org_id, 'James',    'Wilson',   'jwilson@company.com',    '(954)555-0103', 'Lennar Corp',          'Sarah Wilson',    '(954)555-0203', 'Spouse',  'dog',  '2yr lease. Has large dog.'),
  (uuid_generate_v4(), v_org_id, 'TechStart','LLC',      'office@techstart.io',    '(305)555-0104', 'Self',                 'Alex Rivera',     '(305)555-0204', 'CEO',     'none', 'Pays quarterly.'),
  (uuid_generate_v4(), v_org_id, 'Ana',      'Reyes',    'ana.reyes@gmail.com',    '(305)555-0105', 'Univision',            'Rosa Reyes',      '(305)555-0205', 'Mother',  'none', 'May renew.'),
  (uuid_generate_v4(), v_org_id, 'Luis',     'Martinez', 'luis.m@hotmail.com',     '(786)555-0106', 'Miami Port Authority', 'Carmen Martinez', '(786)555-0206', 'Wife',    'none', 'Month-to-month tenant.'),
  (uuid_generate_v4(), v_org_id, 'Karen',    'Lee',      'karen.lee@apple.com',    '(415)555-0107', 'Apple (Remote)',        'John Lee',        '(415)555-0207', 'Father',  'none', 'Remote worker.'),
  (uuid_generate_v4(), v_org_id, 'Pedro',    'Gomez',    'pedro.gomez@gmail.com',  '(305)555-0108', 'Arquitectonica',       'Maria Gomez',     '(305)555-0208', 'Sister',  'none', 'Parking spot B2.'),
  (uuid_generate_v4(), v_org_id, 'Sophie',   'Brown',    'sophie.b@gmail.com',     '(305)555-0109', 'Wynwood Art District', 'Tom Brown',       '(305)555-0209', 'Father',  'cat',  'Artist, studio setup.');

SELECT id INTO v_t1 FROM tenants WHERE org_id = v_org_id AND email = 'maria.santos@gmail.com';
SELECT id INTO v_t2 FROM tenants WHERE org_id = v_org_id AND email = 'd.chen@outlook.com';
SELECT id INTO v_t3 FROM tenants WHERE org_id = v_org_id AND email = 'jwilson@company.com';
SELECT id INTO v_t4 FROM tenants WHERE org_id = v_org_id AND email = 'office@techstart.io';
SELECT id INTO v_t5 FROM tenants WHERE org_id = v_org_id AND email = 'ana.reyes@gmail.com';
SELECT id INTO v_t6 FROM tenants WHERE org_id = v_org_id AND email = 'luis.m@hotmail.com';
SELECT id INTO v_t7 FROM tenants WHERE org_id = v_org_id AND email = 'karen.lee@apple.com';
SELECT id INTO v_t8 FROM tenants WHERE org_id = v_org_id AND email = 'pedro.gomez@gmail.com';
SELECT id INTO v_t9 FROM tenants WHERE org_id = v_org_id AND email = 'sophie.b@gmail.com';

INSERT INTO leases (id, tenant_id, unit_id, org_id, start_date, end_date, type, status, rent_amount, deposit_amount, move_in_date)
VALUES
  (uuid_generate_v4(), v_t1, v_u1,  v_org_id, '2025-02-01', '2026-01-31', 'fixed',          'expired', 1800, 1800, '2025-02-01'),
  (uuid_generate_v4(), v_t2, v_u2,  v_org_id, '2025-05-01', '2026-04-30', 'fixed',          'active',  1400, 1400, '2025-05-01'),
  (uuid_generate_v4(), v_t3, v_u4,  v_org_id, '2024-07-01', '2026-06-30', 'fixed',          'active',  2600, 5200, '2024-07-01'),
  (uuid_generate_v4(), v_t4, v_u5,  v_org_id, '2025-09-01', '2026-08-31', 'fixed',          'active',  1200, 2400, '2025-09-01'),
  (uuid_generate_v4(), v_t5, v_u6,  v_org_id, '2025-10-01', '2026-05-25', 'fixed',          'active',  1600, 1600, '2025-10-01'),
  (uuid_generate_v4(), v_t6, v_u8,  v_org_id, '2024-11-01', NULL,         'month_to_month', 'active',  1500, 1500, '2024-11-01'),
  (uuid_generate_v4(), v_t7, v_u9,  v_org_id, '2025-06-01', '2026-05-31', 'fixed',          'active',  2200, 4400, '2025-06-01'),
  (uuid_generate_v4(), v_t8, v_u11, v_org_id, '2025-04-01', '2026-06-15', 'fixed',          'active',  2800, 5600, '2025-04-01'),
  (uuid_generate_v4(), v_t9, v_u12, v_org_id, '2025-07-01', '2026-06-30', 'fixed',          'active',  3200, 6400, '2025-07-01');

SELECT id INTO v_l1 FROM leases WHERE tenant_id = v_t1;
SELECT id INTO v_l2 FROM leases WHERE tenant_id = v_t2;
SELECT id INTO v_l3 FROM leases WHERE tenant_id = v_t3;
SELECT id INTO v_l4 FROM leases WHERE tenant_id = v_t4;
SELECT id INTO v_l5 FROM leases WHERE tenant_id = v_t5;
SELECT id INTO v_l6 FROM leases WHERE tenant_id = v_t6;
SELECT id INTO v_l7 FROM leases WHERE tenant_id = v_t7;
SELECT id INTO v_l8 FROM leases WHERE tenant_id = v_t8;
SELECT id INTO v_l9 FROM leases WHERE tenant_id = v_t9;

INSERT INTO payments (org_id, lease_id, tenant_id, unit_id, property_id, amount, method, type, period_month, period_year, payment_date, reference)
VALUES
  (v_org_id, v_l1, v_t1, v_u1,  v_p1, 1800, 'ach',   'rent',     4, 2026, '2026-04-01', 'ACH-8821'),
  (v_org_id, v_l3, v_t3, v_u4,  v_p1, 2600, 'card',  'rent',     4, 2026, '2026-04-02', 'CH-3P2'),
  (v_org_id, v_l7, v_t7, v_u9,  v_p3, 2200, 'ach',   'rent',     4, 2026, '2026-04-01', 'ACH-9012'),
  (v_org_id, v_l2, v_t2, v_u2,  v_p1,  700, 'check', 'rent',     4, 2026, '2026-04-10', 'CHK-1042'),
  (v_org_id, v_l2, v_t2, v_u2,  v_p1,   70, 'check', 'late_fee', 4, 2026, '2026-04-06', 'LF-AUTO'),
  (v_org_id, v_l8, v_t8, v_u11, v_p4, 2800, 'zelle', 'rent',     4, 2026, '2026-04-03', 'Zelle');

INSERT INTO vendors (org_id, company_name, contact_name, phone, email, specialty, license_number, hourly_rate, rating)
VALUES
  (v_org_id, 'Miami Plumbing Co.', 'Roberto Diaz',  '(305)555-1001', 'roberto@miamiplumbing.com', 'plumbing',   'PL-48291',  95,  5),
  (v_org_id, 'SunState Electric',  'Mike Torres',   '(305)555-1002', 'mike@sunstateelec.com',     'electrical', 'EC-29183',  110, 5),
  (v_org_id, 'Cool Breeze HVAC',   'Carlos Mendez', '(786)555-1003', 'carlos@coolbreezehvac.com', 'hvac',       'CAC-18293', 120, 4),
  (v_org_id, 'Fix-It General',     'Tom Brady',     '(954)555-1004', 'tom@fixitgeneral.com',      'general',    NULL,        75,  4);

INSERT INTO accounts (org_id, account_number, name, type, normal_balance, description)
VALUES
  (v_org_id, '1010', 'Operating Checking Account', 'asset',     'debit',  'Main operating bank account'),
  (v_org_id, '1020', 'Security Deposit Account',   'asset',     'debit',  'Segregated security deposit holding'),
  (v_org_id, '1100', 'Accounts Receivable',         'asset',     'debit',  'Rent and fees owed by tenants'),
  (v_org_id, '1500', 'Real Estate — Land',          'asset',     'debit',  'Land value'),
  (v_org_id, '1510', 'Real Estate — Buildings',     'asset',     'debit',  'Building value'),
  (v_org_id, '1520', 'Accumulated Depreciation',    'asset',     'credit', 'Contra-asset'),
  (v_org_id, '2010', 'Accounts Payable',            'liability', 'credit', 'Amounts owed to vendors'),
  (v_org_id, '2020', 'Security Deposits Held',      'liability', 'credit', 'Tenant deposits — liability'),
  (v_org_id, '2100', 'Mortgage Payable',            'liability', 'credit', 'Outstanding mortgage'),
  (v_org_id, '3010', 'Owner Equity',                'equity',    'credit', 'Owner capital'),
  (v_org_id, '3020', 'Retained Earnings',           'equity',    'credit', 'Accumulated profits'),
  (v_org_id, '3030', 'Owner Distributions',         'equity',    'debit',  'Withdrawals'),
  (v_org_id, '4010', 'Rental Income',               'revenue',   'credit', 'Base rent from all units'),
  (v_org_id, '4020', 'Late Fee Income',             'revenue',   'credit', 'Late fees charged'),
  (v_org_id, '4030', 'Pet Fee Income',              'revenue',   'credit', 'Monthly pet fees'),
  (v_org_id, '5010', 'Repairs & Maintenance',       'expense',   'debit',  'General repairs'),
  (v_org_id, '5020', 'Plumbing',                    'expense',   'debit',  'Plumbing repairs'),
  (v_org_id, '5030', 'Electrical',                  'expense',   'debit',  'Electrical repairs'),
  (v_org_id, '5040', 'HVAC',                        'expense',   'debit',  'Heating and cooling'),
  (v_org_id, '5050', 'Landscaping',                 'expense',   'debit',  'Lawn care'),
  (v_org_id, '5060', 'Pest Control',                'expense',   'debit',  'Pest control'),
  (v_org_id, '5100', 'Property Insurance',          'expense',   'debit',  'Hazard and liability insurance'),
  (v_org_id, '5110', 'Property Taxes',              'expense',   'debit',  'Annual property tax'),
  (v_org_id, '5200', 'Mortgage Interest',           'expense',   'debit',  'Interest portion of mortgage'),
  (v_org_id, '5210', 'Depreciation Expense',        'expense',   'debit',  'Annual building depreciation'),
  (v_org_id, '5300', 'Property Management Fees',    'expense',   'debit',  'Third-party management'),
  (v_org_id, '5400', 'Utilities',                   'expense',   'debit',  'Common area utilities');

INSERT INTO maintenance_tickets (org_id, property_id, unit_id, tenant_id, title, description, category, priority, status, reported_by, estimated_cost, due_date)
VALUES
  (v_org_id, v_p1, v_u1,  v_t1, 'Kitchen faucet leaking — water damage',        'Water leaking under kitchen sink for 2 days.',        'plumbing',   'urgent', 'in_progress',   'tenant', 150, '2026-04-22'),
  (v_org_id, v_p1, v_u4,  v_t3, 'AC unit not cooling — blowing warm air',        'AC blowing warm air. Unit temperature is 82F.',       'hvac',       'high',   'scheduled',     'tenant', 200, '2026-04-23'),
  (v_org_id, v_p2, v_u6,  v_t5, 'Bedroom outlet sparking — fire hazard',         'Outlet sparked when plugging in phone charger.',      'electrical', 'urgent', 'open',          'tenant', 0,   '2026-04-22'),
  (v_org_id, v_p3, v_u9,  v_t7, 'Dishwasher not draining properly',              'Dishwasher leaves standing water after cycle.',       'appliance',  'medium', 'open',          'tenant', 85,  '2026-04-28'),
  (v_org_id, v_p4, v_u12, v_t9, 'Bathroom ceiling water stain',                  'Growing water stain on bathroom ceiling.',            'structural', 'medium', 'pending_parts', 'tenant', 400, '2026-04-30'),
  (v_org_id, v_p1, v_u2,  v_t2, 'Roach sighting in kitchen',                     'Saw roaches near the stove.',                        'pest',       'low',    'open',          'tenant', 120, '2026-05-05'),
  (v_org_id, v_p3, v_u8,  v_t6, 'Slow drain in bathroom sink',                   'Bathroom sink drains slowly.',                       'plumbing',   'low',    'completed',     'tenant', 75,  '2026-04-15'),
  (v_org_id, v_p4, v_u11, v_t8, 'Parking spot light out',                        'Light above parking spot B2 has been out.',          'other',      'low',    'completed',     'tenant', 45,  '2026-04-18');

RAISE NOTICE 'Seed data inserted successfully for org: %', v_org_id;
END $$;