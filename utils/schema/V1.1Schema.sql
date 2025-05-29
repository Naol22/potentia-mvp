-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table to store profiles linked to Clerk authentication
COMMENT ON TABLE users IS 'Stores user profiles linked to Clerk authentication';

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL DEFAULT auth.jwt()->>'sub', -- Maps to Clerk's `sub` claim
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  org_id TEXT DEFAULT auth.jwt()->>'org_id', -- Links to Clerk organization
  payment_provider_customer_id TEXT, -- Generic field for Stripe/NowPayments customer ID
  crypto_address TEXT CHECK (
    crypto_address IS NULL OR crypto_address ~ '^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$'
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile within their organization
CREATE POLICY "Users can view their own profile" ON users
FOR SELECT TO authenticated
USING (
  user_id = auth.jwt()->>'sub' AND
  (org_id = auth.jwt()->>'org_id' OR org_id IS NULL)
);

-- RLS Policy: Users can insert their own profile within their organization
CREATE POLICY "Users can insert their own profile" ON users
AS PERMISSIVE FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.jwt()->>'sub' AND
  (org_id = auth.jwt()->>'org_id' OR org_id IS NULL)
);

-- RLS Policy: Users can update their own profile within their organization
CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE TO authenticated
USING (
  user_id = auth.jwt()->>'sub' AND
  (org_id = auth.jwt()->>'org_id' OR org_id IS NULL)
);

-- RLS Policy: Only organization admins can manage users in their organization
CREATE POLICY "Only organization admins can manage users" ON users
FOR ALL TO authenticated
USING (
  (
    ((auth.jwt()->>'org_role') = 'org:admin') OR
    ((auth.jwt()->'o'->>'rol') = 'admin')
  ) AND
  (org_id = COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id'))
)
WITH CHECK (
  (
    ((auth.jwt()->>'org_role') = 'org:admin') OR
    ((auth.jwt()->'o'->>'rol') = 'admin')
  ) AND
  (org_id = COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id'))
);

--Very important policy I found that leverage 2FA (We'll showcase this but not to be implemented yet)
CREATE POLICY "Only users that have passed second factor verification can read from table"
ON secured_table
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
  ((SELECT auth.jwt()->'fva'->>1) != '-1')
);





-- Create facilities table to store mining facility locations

CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  details JSONB, -- Can store geospatial data (e.g., {"lat": 40.7128, "lon": -74.0060})
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on the facilities table
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can view facilities within their organization for map display
CREATE POLICY "Authenticated users can view facilities" ON facilities
FOR SELECT TO authenticated
USING (
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
);

-- RLS Policy: Only organization admins can manage facilities
CREATE POLICY "Only organization admins can manage facilities" ON facilities
FOR ALL TO authenticated
USING (
  (
    ((auth.jwt()->>'org_role') = 'org:admin') OR
    ((auth.jwt()->'o'->>'rol') = 'admin')
  ) AND
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
)
WITH CHECK (
  (
    ((auth.jwt()->>'org_role') = 'org:admin') OR
    ((auth.jwt()->'o'->>'rol') = 'admin')
  ) AND
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
);

COMMENT ON TABLE facilities IS 'Stores mining facility locations for front-end map display';







-- Create miners table to store mining hardware details

CREATE TABLE miners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  details JSONB, -- Can store specs (e.g., {"hashrate": 200, "power": 3000})
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on the miners table
ALTER TABLE miners ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can view miners within their organization for selection
CREATE POLICY "Authenticated users can view miners" ON miners
FOR SELECT TO authenticated
USING (
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
);

-- RLS Policy: Only organization admins can manage miners
CREATE POLICY "Only organization admins can manage miners" ON miners
FOR ALL TO authenticated
USING (
  (
    ((auth.jwt()->>'org_role') = 'org:admin') OR
    ((auth.jwt()->'o'->>'rol') = 'admin')
  ) AND
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
)
WITH CHECK (
  (
    ((auth.jwt()->>'org_role') = 'org:admin') OR
    ((auth.jwt()->'o'->>'rol') = 'admin')
  ) AND
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
);

COMMENT ON TABLE miners IS 'Stores mining hardware details for user selection with hosting plans';

-- Create trigger function for updating updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;






-- Create payment_methods table to store payment provider configurations

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  requires_crypto_address BOOLEAN DEFAULT FALSE,
  config JSONB, -- Stores provider-specific settings (e.g., webhook endpoints)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger for updated_at
CREATE TRIGGER set_timestamp_payment_methods
BEFORE UPDATE ON payment_methods
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on the payment_methods table
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can view active payment methods within their organization
CREATE POLICY "Authenticated users can view active payment methods" ON payment_methods
FOR SELECT TO authenticated
USING (
  is_active = TRUE AND
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
);

-- RLS Policy: Only organization admins can manage payment methods
CREATE POLICY "Only organization admins can manage payment methods" ON payment_methods
FOR ALL TO authenticated
USING (
  (
    ((auth.jwt()->>'org_role') = 'org:admin') OR
    ((auth.jwt()->'o'->>'rol') = 'admin')
  ) AND
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
)
WITH CHECK (
  (
    ((auth.jwt()->>'org_role') = 'org:admin') OR
    ((auth.jwt()->'o'->>'rol') = 'admin')
  ) AND
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
);



COMMENT ON TABLE payment_methods IS 'Stores payment provider configurations for Stripe and NowPayments';



INSERT INTO payment_methods (name, display_name, is_active, requires_crypto_address, config) VALUES
('stripe', 'Credit Card (Stripe)', TRUE, TRUE, '{"webhook_endpoint": "/api/webhooks/stripe-webhook"}'),
('nowpayments', 'Crypto (NOWPayments)', TRUE, TRUE, '{"webhook_endpoint": "/api/webhooks/nowpayments-webhook"}');







-- Create currency_code enum for hashrate_plans
CREATE TYPE currency_code AS ENUM ('USD', 'EUR', 'BTC');

-- Create hashrate_plans table to define hashrate-based mining plans

CREATE TABLE hashrate_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hashrate INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'USD',
  duration TEXT NOT NULL DEFAULT 'Monthly Recurring',
  stripe_price_id TEXT, -- Stripe pricing ID for subscriptions
  nowpayments_item_id TEXT, -- NowPayments item ID for subscriptions
  is_subscription BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_hashrate CHECK (hashrate > 0),
  CONSTRAINT positive_price CHECK (price > 0)
);

-- Enable RLS on the hashrate_plans table
ALTER TABLE hashrate_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can view hashrate plans within their organization for checkout
CREATE POLICY "Authenticated users can view hashrate plans" ON hashrate_plans
FOR SELECT TO authenticated
USING (
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
);

-- RLS Policy: Only organization admins can manage hashrate plans
CREATE POLICY "Only organization admins can manage hashrate plans" ON hashrate_plans
FOR ALL TO authenticated
USING (
  (
    ((auth.jwt()->>'org_role') = 'org:admin') OR
    ((auth.jwt()->'o'->>'rol') = 'admin')
  ) AND
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
)
WITH CHECK (
  (
    ((auth.jwt()->>'org_role') = 'org:admin') OR
    ((auth.jwt()->'o'->>'rol') = 'admin')
  ) AND
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
);

COMMENT ON TABLE hashrate_plans IS 'Defines hashrate-based mining plans for checkout display and subscription integration';




-- Insert facility data
INSERT INTO facilities (name) VALUES
('Ethiopia'),
('Dubai'),
('Texas'),
('Finland'),
('Paraguay'),
('Georgia');


-- Insert miner data
INSERT INTO miners (name) VALUES
('Antminer S21');


-- Insert hashrate plans data with null pricing IDs
INSERT INTO hashrate_plans (hashrate, price, currency, duration, is_subscription, stripe_price_id, nowpayments_item_id) VALUES
(100, 150.00, 'USD', 'Monthly Recurring', TRUE, NULL, NULL),
(300, 450.00, 'USD', 'Monthly Recurring', TRUE, NULL, NULL),
(500, 750.00, 'USD', 'Monthly Recurring', TRUE, NULL, NULL),
(1000, 150.00, 'USD', 'Monthly Recurring', TRUE, NULL, NULL),
(1500, 2250.00, 'USD', 'Monthly Recurring', TRUE, NULL, NULL),
(2000, 3000.00, 'USD', 'Monthly Recurring', TRUE, NULL, NULL),
(2500, 3750.00, 'USD', 'Monthly Recurring', TRUE, NULL, NULL),
(3000, 4500.00, 'USD', 'Monthly Recurring', TRUE, NULL, NULL);









-- Create hosting_plans table to store hosting_plans plans for crypto mining

CREATE TABLE hosting_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  miner_id UUID REFERENCES miners(id) ON DELETE SET NULL,
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'USD',
  duration TEXT NOT NULL DEFAULT 'Monthly Recurring',
  stripe_price_id TEXT, -- Stripe pricing ID for subscriptions
  nowpayments_item_id TEXT, -- NowPayments item ID for subscriptions
  is_subscription BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_price CHECK (price > 0)
);

-- Enable RLS on the hosting_plans table
ALTER TABLE hosting_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can view hosting_plans plans within their organization
CREATE POLICY "Authenticated users can view hosting_plans " ON hosting_plans
FOR SELECT TO authenticated
USING (
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
);

-- RLS Policy: Only organization admins can manage hosting_plans plans
CREATE POLICY "Only organization admins can manage hosting_plans" ON hosting_plans
FOR ALL TO authenticated
USING (
  (
    ((auth.jwt()->>'org_role') = 'org:admin') OR
    ((auth.jwt()->'o'->>'rol') = 'admin')
  ) AND
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
)
WITH CHECK (
  (
    ((auth.jwt()->>'org_role') = 'org:admin') OR
    ((auth.jwt()->'o'->>'rol') = 'admin')
  ) AND
  (COALESCE(auth.jwt()->>'org_id', auth.jwt()->'o'->>'id') IS NOT NULL)
);
COMMENT ON TABLE hosting_plans IS 'Stores hosting_plans plans for crypto mining with miner and facility details';





-- Insert hosting plans data
INSERT INTO hosting_plans (miner_id, facility_id, price, currency, duration, stripe_price_id, nowpayments_item_id, is_subscription)
SELECT
  m.id AS miner_id,
  f.id AS facility_id,
  CASE
    WHEN f.name = 'Ethiopia' THEN 80.00
    WHEN f.name = 'Dubai' THEN 120.00
    WHEN f.name = 'Texas' THEN 100.00
    WHEN f.name = 'Finland' THEN 110.00
    WHEN f.name = 'Paraguay' THEN 90.00
    WHEN f.name = 'Georgia' THEN 95.00
  END AS price,
  'USD' AS currency,
  'Monthly Recurring' AS duration,
  NULL AS stripe_price_id, -- Not set up yet
  NULL AS nowpayments_item_id, -- Not set up yet
  TRUE AS is_subscription
FROM miners m
JOIN facilities f ON TRUE
WHERE m.name = 'Antminer S21';






--The Following Are Updates to the tables and policies regarding the use of single orgs and 2 roles only (We ain't paying a hunnid for a custom role f that)
-- Alter users table to make org_id nullable (remove default)
ALTER TABLE users
  ALTER COLUMN org_id DROP DEFAULT,
  ALTER COLUMN org_id DROP NOT NULL;

-- Update RLS policies
-- Policy: Users can view their own profile
ALTER POLICY "Users can view their own profile" ON users
  FOR SELECT
  USING (user_id = auth.jwt()->>'sub');

-- Policy: Users can insert their own profile
ALTER POLICY "Users can insert their own profile" ON users
  FOR INSERT
  WITH CHECK (user_id = auth.jwt()->>'sub');

-- Policy: Users can update their own profile
ALTER POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING (user_id = auth.jwt()->>'sub');

-- Policy: Only organization admins can manage users
ALTER POLICY "Only organization admins can manage users" ON users
  FOR ALL
  USING (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  )
  WITH CHECK (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  );

  -- Update RLS policies for facilities
-- Policy: Authenticated users can view facilities
ALTER POLICY "Authenticated users can view facilities" ON facilities
  USING (true);

-- Policy: Only organization admins can manage facilities
ALTER POLICY "Only organization admins can manage facilities" ON facilities
  USING (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  )
  WITH CHECK (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  );
