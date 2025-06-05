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

-- Update RLS policies for miners
-- Policy: Authenticated users can view miners
ALTER POLICY "Authenticated users can view miners" ON miners
  USING (true);

-- Policy: Only organization admins can manage miners
ALTER POLICY "Only organization admins can manage miners" ON miners
  USING (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  )
  WITH CHECK (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  );


-- Update RLS policies for hashrate_plans
-- Policy: Authenticated users can view hashrate plans
ALTER POLICY "Authenticated users can view hashrate plans" ON hashrate_plans
  USING (true);

-- Policy: Only organization admins can manage hashrate plans
ALTER POLICY "Only organization admins can manage hashrate plans" ON hashrate_plans
  USING (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  )
  WITH CHECK (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  );


-- Update RLS policies for hosting_plans
-- Policy: Authenticated users can view hosting plans
ALTER POLICY "Authenticated users can view hosting_plans" ON hosting_plans
  USING (true);

-- Policy: Only organization admins can manage hosting plans
ALTER POLICY "Only organization admins can manage hosting_plans" ON hosting_plans
  USING (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  )
  WITH CHECK (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  );








-- Create transaction_status enum
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create payment_type enum
CREATE TYPE payment_type AS ENUM ('subscription', 'one_time');

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Links to the user making the transaction
  plan_type TEXT NOT NULL CHECK (plan_type IN ('hashrate', 'hosting')), -- Specifies plan type
  plan_id UUID NOT NULL, -- References hashrate_plans.id or hosting_plans.id based on plan_type
  payment_type payment_type NOT NULL, -- Indicates subscription or one-time payment
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'BTC')),
  status transaction_status NOT NULL DEFAULT 'pending',
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  payment_provider_reference TEXT, -- E.g., Stripe charge ID or NowPayments transaction ID
  metadata JSONB, -- Stores additional details (e.g., invoice, plan details)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT valid_plan_reference_hashrate FOREIGN KEY (plan_id) REFERENCES hashrate_plans(id) ON DELETE CASCADE,
  CONSTRAINT valid_plan_reference_hosting FOREIGN KEY (plan_id) REFERENCES hosting_plans(id) ON DELETE CASCADE
);

-- Enable RLS on the transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view and manage transactions
CREATE POLICY "Admins can manage transactions" ON transactions
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  )
  WITH CHECK (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  );

-- Default deny policy to ensure no unauthorized access
CREATE POLICY "Deny all other access" ON transactions
  FOR ALL
  TO authenticated
  USING (false);

COMMENT ON TABLE transactions IS 'Admin-only table to store payment transactions for hashrate and hosting plans';





-- Create subscription_status enum (covering Stripe and NowPayments statuses)
CREATE TYPE subscription_status AS ENUM (
  'active',      -- Common: Subscription is active
  'past_due',    -- Stripe: Payment failed but still retrying
  'unpaid',      -- Stripe: Payment failed after retries
  'canceled',    -- Common: Subscription canceled
  'failed',      -- NowPayments: Payment failed
  'expired',     -- NowPayments: Subscription expired
  'incomplete',  -- Stripe: Awaiting initial payment
  'trialing'     -- Stripe: In trial period
);

-- Create subscriptions table

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('hashrate', 'hosting')), -- Specifies plan type
  plan_id UUID NOT NULL, -- References hashrate_plans.id or hosting_plans.id based on plan_type
  status subscription_status NOT NULL DEFAULT 'active',
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  provider_subscription_id TEXT NOT NULL, -- Stripe sub_xxx or NowPayments subscription_id
  current_period_start TIMESTAMP WITH TIME ZONE, -- Stripe: Exact period start; NowPayments: Inferred
  current_period_end TIMESTAMP WITH TIME ZONE, -- Stripe: Exact period end; NowPayments: Inferred
  cancel_at_period_end BOOLEAN DEFAULT FALSE, -- Stripe: Cancel at period end; NowPayments: N/A
  canceled_at TIMESTAMP WITH TIME ZONE, -- Common: When subscription was canceled
  metadata JSONB, -- Stores provider-specific data (e.g., latest_invoice, payment_id)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_period_dates CHECK (
    current_period_start IS NULL OR current_period_end IS NULL OR current_period_start <= current_period_end
  ),
  CONSTRAINT valid_plan_reference_hashrate FOREIGN KEY (plan_id) REFERENCES hashrate_plans(id) ON DELETE CASCADE,
  CONSTRAINT valid_plan_reference_hosting FOREIGN KEY (plan_id) REFERENCES hosting_plans(id) ON DELETE CASCADE
);

-- Add trigger for updated_at
CREATE TRIGGER set_timestamp_subscriptions
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on the subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE user_id = auth.jwt()->>'sub'));

-- RLS Policy: Admins can manage all subscriptions
CREATE POLICY "Admins can manage subscriptions" ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  )
  WITH CHECK (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  );

-- Default deny policy to ensure no unauthorized access
CREATE POLICY "Deny all other access to subscriptions" ON subscriptions
  FOR ALL
  TO authenticated
  USING (false);

COMMENT ON TABLE subscriptions IS 'Stores recurring subscription details for Stripe and NowPayments';


-- Alter transactions table to enhance scalability
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL; -- Link to subscription for recurring payments
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'; -- Store additional payment details (e.g., bundle info)


  CREATE OR REPLACE FUNCTION check_valid_plan_ids()
RETURNS trigger AS $$
DECLARE
  plan jsonb;
  valid_ids jsonb;
BEGIN
  -- Get all valid plan IDs from both tables
  SELECT jsonb_agg(id) INTO valid_ids
  FROM (
    SELECT id FROM hashrate_plans
    UNION ALL
    SELECT id FROM hosting_plans
  ) AS all_ids;

  -- Check each element in plan_ids
  FOR plan IN SELECT * FROM jsonb_array_elements(NEW.plan_ids)
  LOOP
    IF NOT (plan <@ valid_ids) THEN
      RAISE EXCEPTION 'Invalid plan ID: %', plan;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER validate_plan_ids_trigger
BEFORE INSERT OR UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION check_valid_plan_ids();


-- Create order_status enum (covering order lifecycle states)
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'canceled', 'failed');

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('hashrate', 'hosting', 'bundle')),
  plan_ids JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_array_length(plan_ids) > 0),
  transaction_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  crypto_address TEXT CHECK (
    crypto_address IS NULL OR crypto_address ~ '^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$'
  ),
  status order_status NOT NULL DEFAULT 'pending',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT FALSE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_order_dates CHECK (
    start_date IS NULL OR end_date IS NULL OR start_date <= end_date
  ),
  CONSTRAINT valid_plan_ids_check CHECK (
    (plan_type = 'bundle' AND jsonb_array_length(plan_ids) > 1) OR
    (plan_type IN ('hashrate', 'hosting') AND jsonb_array_length(plan_ids) = 1)
  ),
  CONSTRAINT valid_transaction_ids CHECK (
    array_length(transaction_ids, 1) > 0 OR subscription_id IS NOT NULL
  )
);

-- Add trigger for updated_at (assuming update_updated_at_column() exists)
CREATE TRIGGER set_timestamp_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on the orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE user_id = auth.jwt()->>'sub'));

-- RLS Policy: Admins can manage all orders
CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  )
  WITH CHECK (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  );

-- Default deny policy to ensure no unauthorized access
CREATE POLICY "Deny all other access to orders" ON orders
  FOR ALL
  TO authenticated
  USING (false);

COMMENT ON TABLE orders IS 'Unified view of user orders aggregating transactions and subscriptions for plans or services';

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS checkout_session_id TEXT; -- Store Stripe/NowPayments session ID for reference





-- Create subscription_sessions table

CREATE TABLE subscription_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE, -- Link to subscription
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'nowpayments')), -- Identify provider
  session_id TEXT NOT NULL, -- Stripe session ID (cs_xxx) or NowPayments payment ID
  session_url TEXT NOT NULL, -- URL for hosted checkout
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Session expiry (Stripe: 24h, NowPayments: varies)
  is_used BOOLEAN DEFAULT FALSE, -- Track if session was completed
  metadata JSONB DEFAULT '{}', -- Store additional data (e.g., payment intent)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_session_id UNIQUE (session_id) -- Prevent duplicates
);

-- Enable RLS on the subscription_sessions table
ALTER TABLE subscription_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own sessions
CREATE POLICY "Users can view their own sessions" ON subscription_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE user_id = auth.jwt()->>'sub'));

-- RLS Policy: Admins can manage all sessions
CREATE POLICY "Admins can manage sessions" ON subscription_sessions
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  )
  WITH CHECK (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  );

-- Default deny policy
CREATE POLICY "Deny all other access to sessions" ON subscription_sessions
  FOR ALL
  TO authenticated
  USING (false);

COMMENT ON TABLE subscription_sessions IS 'Stores secure session links for Stripe and NowPayments hosted checkouts';



-- Create subscription_events table

CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'created', 'updated', 'canceled', 'renewed', 'payment_failed', 'payment_succeeded'
    )
  ), -- Common lifecycle events
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'nowpayments')),
  data JSONB NOT NULL, -- Event payload (e.g., webhook data)
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  error_message TEXT, -- Error details if status = 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger for updated_at
CREATE TRIGGER set_timestamp_subscription_events
  BEFORE UPDATE ON subscription_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on the subscription_events table
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage all events (read-only for debugging)
CREATE POLICY "Admins can manage subscription events" ON subscription_events
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  )
  WITH CHECK (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  );

-- Default deny policy
CREATE POLICY "Deny all other access to subscription events" ON subscription_events
  FOR ALL
  TO authenticated
  USING (false);

COMMENT ON TABLE subscription_events IS 'Logs lifecycle events for subscriptions (e.g., updates, cancellations)';


-- Create survey_responses table

CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  anonymous_user_id UUID DEFAULT uuid_generate_v4(),
  satisfaction INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  issue TEXT,
  suggestion TEXT,
  nps INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_satisfaction CHECK (satisfaction BETWEEN 1 AND 5),
  CONSTRAINT valid_nps CHECK (nps IS NULL OR nps BETWEEN 0 AND 10)
);

-- Add index for querying by user
CREATE INDEX idx_survey_responses_user_id ON survey_responses(user_id, created_at);

-- Enable RLS on the survey_responses table
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own responses
CREATE POLICY "Users can view their own responses" ON survey_responses
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE user_id = auth.jwt()->>'sub'));

CREATE POLICY "Users can insert their own responses" ON survey_responses
  FOR INSERT
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE user_id = auth.jwt()->>'sub'));


-- RLS Policy: Admins can manage all responses
CREATE POLICY "Admins can manage responses" ON survey_responses
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  )
  WITH CHECK (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  );

-- Default deny policy
CREATE POLICY "Deny all other access to survey_responses" ON survey_responses
  FOR ALL
  TO authenticated
  USING (false);


COMMENT ON TABLE survey_responses IS 'Stores user feedback and satisfaction ratings';


-- Create notifications table
COMMENT ON TABLE notifications IS 'Stores global notifications for subscriptions, invoices, and updates';

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL, -- Link to payment events
  type TEXT NOT NULL CHECK (
    type IN ('new_subscription', 'invoice_due', 'subscription_ending', 'payment_failed', 'general_update')
  ),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE, -- For delayed notifications
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger for updated_at
CREATE TRIGGER set_timestamp_notifications
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on the notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE user_id = auth.jwt()->>'sub'));

-- RLS Policy: Admins can manage all notifications
CREATE POLICY "Admins can manage notifications" ON notifications
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  )
  WITH CHECK (
    ((auth.jwt()->>'org_role' = 'admin') OR (auth.jwt()->'o'->>'rol' = 'admin'))
  );

-- Default deny policy
CREATE POLICY "Deny all other access to notifications" ON notifications
  FOR ALL
  TO authenticated
  USING (false);




--Rollback of Bundle Logic in subscriptions Table (Will not be impelemted for thsi version)
-- Drop the trigger and function
DROP TRIGGER IF EXISTS validate_plan_ids_trigger ON subscriptions;
DROP FUNCTION IF EXISTS check_valid_plan_ids;

-- Remove the plan_ids column and related constraints
ALTER TABLE subscriptions
  DROP COLUMN IF EXISTS plan_ids,
  DROP CONSTRAINT IF EXISTS valid_plan_ids;

-- Revert plan_id to NOT NULL with reference to hashrate_plans or hosting_plans
ALTER TABLE subscriptions
  ALTER COLUMN plan_id SET NOT NULL,
  ALTER COLUMN plan_id SET DEFAULT NULL,
  ADD CONSTRAINT plan_id_check CHECK (
    EXISTS (SELECT 1 FROM hashrate_plans WHERE id = plan_id) OR
    EXISTS (SELECT 1 FROM hosting_plans WHERE id = plan_id)
  );

-- Recreate the original foreign key constraint (adjusted for separate plans tables)
ALTER TABLE subscriptions
  ADD CONSTRAINT fk_plan_id
  FOREIGN KEY (plan_id)
  REFERENCES hashrate_plans(id)
  ON DELETE SET NULL
  DEFERRABLE INITIALLY DEFERRED; -- Add a deferrable FK to allow flexibility if needed later




--Notable Indexes for Performance Optimization
-- users table
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id); -- Corrected from clerk_user_id (assuming typo)
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id); -- For organization-based queries
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at); -- For recent user tracking

-- facilities table
CREATE INDEX IF NOT EXISTS idx_facilities_name ON facilities(name); -- For searching facilities
CREATE INDEX IF NOT EXISTS idx_facilities_created_at ON facilities(created_at); -- For recent additions

-- miners table
CREATE INDEX IF NOT EXISTS idx_miners_name ON miners(name); -- For searching miners
CREATE INDEX IF NOT EXISTS idx_miners_created_at ON miners(created_at); -- For recent additions

-- payment_methods table
CREATE INDEX IF NOT EXISTS idx_payment_methods_name ON payment_methods(name); -- For payment method lookup
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_active ON payment_methods(is_active); -- For active methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_created_at ON payment_methods(created_at); -- For recent configs

-- hashrate_plans table
CREATE INDEX IF NOT EXISTS idx_hashrate_plans_hashrate ON hashrate_plans(hashrate); -- For plan selection
CREATE INDEX IF NOT EXISTS idx_hashrate_plans_price ON hashrate_plans(price); -- For price filtering
CREATE INDEX IF NOT EXISTS idx_hashrate_plans_created_at ON hashrate_plans(created_at); -- For recent plans

-- hosting_plans table
CREATE INDEX IF NOT EXISTS idx_hosting_plans_miner_id ON hosting_plans(miner_id); -- For miner-based queries
CREATE INDEX IF NOT EXISTS idx_hosting_plans_facility_id ON hosting_plans(facility_id); -- For facility-based queries
CREATE INDEX IF NOT EXISTS idx_hosting_plans_price ON hosting_plans(price); -- For price filtering
CREATE INDEX IF NOT EXISTS idx_hosting_plans_created_at ON hosting_plans(created_at); -- For recent plans

-- transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id); -- For user payment history
CREATE INDEX IF NOT EXISTS idx_transactions_plan_id ON transactions(plan_id); -- For plan-based queries
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status); -- For payment status filtering
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at); -- For recent transactions
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON transactions(subscription_id); -- For subscription payments

-- subscriptions table
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id); -- For user subscription history
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id); -- For plan-based queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status); -- For subscription status filtering
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at); -- For recent subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end); -- For nearly ending subscriptions

-- orders table
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id); -- For user order history
CREATE INDEX IF NOT EXISTS idx_orders_plan_id ON orders(plan_ids); -- For plan-based queries (using plan_ids for consistency, though reverted)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status); -- For order status filtering
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at); -- For recent orders
CREATE INDEX IF NOT EXISTS idx_orders_transaction_ids ON orders USING GIN(transaction_ids); -- For array searches
CREATE INDEX IF NOT EXISTS idx_orders_next_billing_date ON orders(next_billing_date); -- For billing reminders

-- subscription_sessions table
CREATE INDEX IF NOT EXISTS idx_subscription_sessions_user_id ON subscription_sessions(user_id); -- For user session tracking
CREATE INDEX IF NOT EXISTS idx_subscription_sessions_subscription_id ON subscription_sessions(subscription_id); -- For subscription sessions
CREATE INDEX IF NOT EXISTS idx_subscription_sessions_expires_at ON subscription_sessions(expires_at); -- For expiry cleanup
CREATE INDEX IF NOT EXISTS idx_subscription_sessions_is_used ON subscription_sessions(is_used); -- For unused session filtering

-- subscription_events table
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON subscription_events(subscription_id); -- For event lookup
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id); -- For user event history
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON subscription_events(event_type); -- For event type filtering
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON subscription_events(created_at); -- For recent events

-- survey_responses table
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON survey_responses(user_id); -- For user feedback
CREATE INDEX IF NOT EXISTS idx_survey_responses_satisfaction ON survey_responses(satisfaction); -- For satisfaction analysis
CREATE INDEX IF NOT EXISTS idx_survey_responses_completed ON survey_responses(completed); -- For completed surveys
CREATE INDEX IF NOT EXISTS idx_survey_responses_nps ON survey_responses(nps); -- For NPS analysis
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at); -- For recent responses

-- notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id); -- For user notifications
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status); -- For status filtering
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at); -- For scheduled notifications
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at); -- For recent notifications




-- USERS
DROP POLICY IF EXISTS "Only organization admins can manage users" ON users;

CREATE POLICY "Only organization admins can manage users"
ON users
FOR ALL
USING (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
)
WITH CHECK (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
);

-- TRANSACTIONS
DROP POLICY IF EXISTS "Admins can manage transactions" ON transactions;

CREATE POLICY "Admins can manage transactions"
ON transactions
FOR ALL
USING (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
)
WITH CHECK (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
);

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON subscriptions;

CREATE POLICY "Admins can manage subscriptions"
ON subscriptions
FOR ALL
USING (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
)
WITH CHECK (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
);

-- ORDERS
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;

CREATE POLICY "Admins can manage orders"
ON orders
FOR ALL
USING (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
)
WITH CHECK (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
);

-- SUBSCRIPTION SESSIONS
DROP POLICY IF EXISTS "Admins can manage sessions" ON subscription_sessions;

CREATE POLICY "Admins can manage sessions"
ON subscription_sessions
FOR ALL
USING (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
)
WITH CHECK (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
);

-- SUBSCRIPTION EVENTS
DROP POLICY IF EXISTS "Admins can manage subscription events" ON subscription_events;

CREATE POLICY "Admins can manage subscription events"
ON subscription_events
FOR ALL
USING (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
)
WITH CHECK (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
);

-- FACILITIES
DROP POLICY IF EXISTS "Only organization admins can manage facilities" ON facilities;

CREATE POLICY "Only organization admins can manage facilities"
ON facilities
FOR ALL
USING (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
)
WITH CHECK (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
);

-- MINERS
DROP POLICY IF EXISTS "Only organization admins can manage miners" ON miners;

CREATE POLICY "Only organization admins can manage miners"
ON miners
FOR ALL
USING (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
)
WITH CHECK (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
);

-- PAYMENT METHODS
DROP POLICY IF EXISTS "Only organization admins can manage payment methods" ON payment_methods;

CREATE POLICY "Only organization admins can manage payment methods"
ON payment_methods
FOR ALL
USING (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
)
WITH CHECK (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
);

-- HASHRATE PLANS
DROP POLICY IF EXISTS "Only organization admins can manage hashrate plans" ON hashrate_plans;

CREATE POLICY "Only organization admins can manage hashrate plans"
ON hashrate_plans
FOR ALL
USING (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
)
WITH CHECK (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
);

-- HOSTING PLANS
DROP POLICY IF EXISTS "Only organization admins can manage hosting plans" ON hosting_plans;

CREATE POLICY "Only organization admins can manage hosting plans"
ON hosting_plans
FOR ALL
USING (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
)
WITH CHECK (
  (auth.jwt()->'o'->>'rol' = 'admin') OR
  (auth.jwt()->>'org_role' = 'org:admin')
);

CREATE POLICY "Allow individual insert access for transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.jwt()->>'sub');

GRANT USAGE ON SCHEMA public TO authenticated; -- If not already granted
GRANT ALL ON TABLE public.transactions TO authenticated; -- Or be more specific:
-- GRANT SELECT ON public.transactions TO authenticated;
-- GRANT INSERT ON public.transactions TO authenticated;
-- GRANT UPDATE ON public.transactions TO authenticated;
-- GRANT DELETE ON public.transactions TO authenticated;

-- Also ensure the sequence (if you have auto-incrementing IDs) is usable
-- Replace your_table_id_seq with the actual sequence name for your transactions table's primary key if it's a serial type
-- You can find the sequence name by looking at the table definition or in the Postgres docs for serial types.
-- Often it's public.transactions_id_seq if your primary key column is named 'id'.
GRANT USAGE, SELECT ON SEQUENCE public.transactions_id_seq TO authenticated; -- (Replace with actual sequence name)

-- Drop existing table with CASCADE to handle any dependencies
DROP TABLE IF EXISTS public.survey_responses CASCADE;

-- Drop the index if it exists
DROP INDEX IF EXISTS public.idx_survey_responses_user_id;

-- Recreate the survey_responses table with user_id as text
CREATE TABLE public.survey_responses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id text NULL,
  anonymous_user_id uuid NULL DEFAULT uuid_generate_v4(),
  satisfaction integer NOT NULL,
  completed boolean NOT NULL DEFAULT true,
  issue text NULL,
  suggestion text NULL,
  nps integer NULL,
  metadata jsonb NULL,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT survey_responses_pkey PRIMARY KEY (id),
  CONSTRAINT survey_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT valid_nps CHECK (
    ((nps IS NULL) OR ((nps >= 0) AND (nps <= 10)))
  ),
  CONSTRAINT valid_satisfaction CHECK (
    ((satisfaction >= 1) AND (satisfaction <= 5))
  )
) TABLESPACE pg_default;

-- Recreate the index
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id 
ON public.survey_responses USING btree (user_id, created_at) 
TABLESPACE pg_default;

-- Enable Row Level Security on the table
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Allow authenticated users to read their own survey responses
CREATE POLICY select_own_survey_responses
ON public.survey_responses
FOR SELECT
TO authenticated
USING (
  user_id = (auth.jwt() ->> 'sub') OR
  anonymous_user_id IS NOT NULL
);

-- INSERT policy: Allow authenticated users to create survey responses only for themselves
CREATE POLICY insert_own_survey_responses
ON public.survey_responses
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (auth.jwt() ->> 'sub')
);

-- UPDATE policy: Allow authenticated users to update their own survey responses
CREATE POLICY update_own_survey_responses
ON public.survey_responses
FOR UPDATE
TO authenticated
USING (
  user_id = (auth.jwt() ->> 'sub')
)
WITH CHECK (
  user_id = (auth.jwt() ->> 'sub')
);

-- DELETE policy: Allow authenticated users to delete their own survey responses
CREATE POLICY delete_own_survey_responses
ON public.survey_responses
FOR DELETE
TO authenticated
USING (
  user_id = (auth.jwt() ->> 'sub')
);

-- Drop existing tables with CASCADE to handle dependencies
DROP TRIGGER IF EXISTS set_timestamp_subscription_events ON public.subscription_events CASCADE;
DROP TABLE IF EXISTS public.subscription_events CASCADE;

DROP TRIGGER IF EXISTS set_timestamp_subscriptions ON public.subscriptions CASCADE;
DROP TRIGGER IF EXISTS validate_plan_ids_trigger ON public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;

DROP TABLE IF EXISTS public.subscription_sessions CASCADE;

-- Recreate tables with updated user_id as text and foreign key references

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id text NULL,
  plan_type text NOT NULL,
  plan_id uuid NOT NULL,
  status public.subscription_status NOT NULL DEFAULT 'active'::subscription_status,
  payment_method_id uuid NULL,
  provider_subscription_id text NOT NULL,
  current_period_start timestamp with time zone NULL,
  current_period_end timestamp with time zone NULL,
  cancel_at_period_end boolean NULL DEFAULT false,
  canceled_at timestamp with time zone NULL,
  metadata jsonb NULL,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  checkout_session_id text NULL,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id) ON DELETE SET NULL,
  CONSTRAINT valid_plan_reference_hosting FOREIGN KEY (plan_id) REFERENCES hosting_plans (id) ON DELETE CASCADE,
  CONSTRAINT valid_plan_reference_hashrate FOREIGN KEY (plan_id) REFERENCES hashrate_plans (id) ON DELETE CASCADE,
  CONSTRAINT fk_plan_id FOREIGN KEY (plan_id) REFERENCES hashrate_plans (id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT subscriptions_plan_type_check CHECK (
    (plan_type = ANY (ARRAY['hashrate'::text, 'hosting'::text]))
  ),
  CONSTRAINT valid_period_dates CHECK (
    ((current_period_start IS NULL)
    OR (current_period_end IS NULL)
    OR (current_period_start <= current_period_end))
)
TABLESPACE pg_default;

-- Recreate triggers for subscriptions
CREATE TRIGGER set_timestamp_subscriptions BEFORE
UPDATE ON subscriptions FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER validate_plan_ids_trigger BEFORE INSERT OR
UPDATE ON subscriptions FOR EACH ROW
EXECUTE FUNCTION check_valid_plan_ids();

-- Subscription sessions table
CREATE TABLE public.subscription_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id text NULL,
  subscription_id uuid NULL,
  provider text NOT NULL,
  session_id text NOT NULL,
  session_url text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  is_used boolean NULL DEFAULT false,
  metadata jsonb NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT subscription_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT unique_session_id UNIQUE (session_id),
  CONSTRAINT subscription_sessions_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE,
  CONSTRAINT subscription_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT subscription_sessions_provider_check CHECK (
    (provider = ANY (ARRAY['stripe'::text, 'nowpayments'::text]))
)
TABLESPACE pg_default;

-- Subscription events table
CREATE TABLE public.subscription_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  subscription_id uuid NOT NULL,
  user_id text NOT NULL,
  event_type text NOT NULL,
  provider text NOT NULL,
  data jsonb NOT NULL,
  status text NOT NULL DEFAULT 'success'::text,
  error_message text NULL,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT subscription_events_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_events_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE,
  CONSTRAINT subscription_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT subscription_events_event_type_check CHECK (
    (event_type = ANY (
      ARRAY[
        'created'::text,
        'updated'::text,
        'canceled'::text,
        'renewed'::text,
        'payment_failed'::text,
        'payment_succeeded'::text
      ]
    ))
  ),
  CONSTRAINT subscription_events_provider_check CHECK (
    (provider = ANY (ARRAY['stripe'::text, 'nowpayments'::text]))
  ),
  CONSTRAINT subscription_events_status_check CHECK (
    (status = ANY (ARRAY['success'::text, 'failed'::text]))
)
TABLESPACE pg_default;

-- Recreate trigger for subscription_events
CREATE TRIGGER set_timestamp_subscription_events BEFORE
UPDATE ON subscription_events FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Recreate the foreign key constraints for dependent tables
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_subscription_id_fkey 
FOREIGN KEY (subscription_id) REFERENCES public.subscriptions (id);

ALTER TABLE public.orders 
ADD CONSTRAINT orders_subscription_id_fkey 
FOREIGN KEY (subscription_id) REFERENCES public.subscriptions (id);