-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for status and currency fields
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'unpaid');
CREATE TYPE order_status AS ENUM ('pending', 'active', 'canceled', 'expired');
CREATE TYPE plan_type AS ENUM ('hashrate', 'hosting', 'custom');
CREATE TYPE currency_code AS ENUM ('USD', 'EUR', 'BTC');

-- Create trigger function for updating updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users table
COMMENT ON TABLE users IS 'Stores user profiles linked to Clerk authentication';
COMMENT ON COLUMN users.clerk_user_id IS 'Unique user ID from Clerk authentication provider, explicitly interpreted as text';
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL DEFAULT (auth.jwt()->>'sub')::text,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT NULL,
  email TEXT,
  stripe_customer_id TEXT NULL,
  btc_address TEXT NULL CHECK (
    btc_address IS NULL OR btc_address ~ '^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$'
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facilities table
COMMENT ON TABLE facilities IS 'Stores mining facility locations';
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Miners table
COMMENT ON TABLE miners IS 'Stores mining hardware details';
CREATE TABLE miners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods table
COMMENT ON TABLE payment_methods IS 'Stores payment provider configurations';
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  requires_crypto_address BOOLEAN DEFAULT FALSE,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Plans table
COMMENT ON TABLE plans IS 'Defines hashrate-based mining plans with pricing and facility details';
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type plan_type NOT NULL DEFAULT 'hashrate',
  hashrate INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'USD',
  duration TEXT NOT NULL DEFAULT 'Monthly Recurring',
  miner_id UUID REFERENCES miners(id) ON DELETE SET NULL,
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  stripe_price_id TEXT,
  bitpay_item_code TEXT,
  is_subscription BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_price CHECK (price > 0),
  CONSTRAINT positive_hashrate CHECK (hashrate > 0)
);

-- Hosting table
COMMENT ON TABLE hosting IS 'Stores hosting service details for miners';
CREATE TABLE hosting (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  miner_id UUID REFERENCES miners(id) ON DELETE SET NULL,
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'USD',
  duration TEXT NOT NULL DEFAULT 'Monthly Recurring',
  stripe_price_id TEXT,
  bitpay_item_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_price CHECK (price > 0)
);

-- Transactions table
COMMENT ON TABLE transactions IS 'Stores payment transactions for plans';
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'USD',
  status transaction_status NOT NULL DEFAULT 'pending',
  description TEXT,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  payment_provider_reference TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Subscriptions table
COMMENT ON TABLE subscriptions IS 'Stores recurring subscription details';
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  provider_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_period_dates CHECK (
    current_period_start IS NULL OR current_period_end IS NULL OR current_period_start <= current_period_end
  )
);

-- Orders table
COMMENT ON TABLE orders IS 'Stores user orders for plans or services';
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  crypto_address TEXT CHECK (
    crypto_address IS NULL OR crypto_address ~ '^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$'
  ),
  status order_status NOT NULL DEFAULT 'pending',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT FALSE,
  auto_renew BOOLEAN DEFAULT FALSE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_order_dates CHECK (
    start_date IS NULL OR end_date IS NULL OR start_date <= end_date
  )
);

-- Subscription sessions table
COMMENT ON TABLE subscription_sessions IS 'Stores secure session links for subscription management';
CREATE TABLE subscription_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  session_url TEXT NOT NULL,
  session_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription events table
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Survey responses table
COMMENT ON TABLE survey_responses IS 'Stores user feedback and satisfaction ratings';
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

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Payment attempts table
CREATE TABLE payment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX idx_subscription_events_subscription_id ON subscription_events(subscription_id);
CREATE INDEX idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX idx_subscription_events_event_type ON subscription_events(event_type);
CREATE INDEX idx_subscription_events_created_at ON subscription_events(created_at);

CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_plans_facility_id ON plans(facility_id);
CREATE INDEX idx_plans_miner_id ON plans(miner_id);
CREATE INDEX idx_plans_hashrate ON plans(hashrate);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_plan_id ON transactions(plan_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_created_at ON subscriptions(created_at);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_plan_id ON orders(plan_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_payment_attempts_subscription_id ON payment_attempts(subscription_id);
CREATE INDEX idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX idx_survey_responses_satisfaction ON survey_responses(satisfaction);
CREATE INDEX idx_survey_responses_completed ON survey_responses(completed);
CREATE INDEX idx_survey_responses_nps ON survey_responses(nps);
CREATE INDEX idx_survey_responses_created_at ON survey_responses(created_at);

-- Add triggers for updated_at
CREATE TRIGGER set_timestamp_payment_methods
BEFORE UPDATE ON payment_methods
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_subscriptions
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_subscription_events
BEFORE UPDATE ON subscription_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE subscription_events IS 'Tracks all subscription-related events and changes';
COMMENT ON COLUMN subscription_events.id IS 'Unique identifier for the event';
COMMENT ON COLUMN subscription_events.subscription_id IS 'Reference to the subscription';
COMMENT ON COLUMN subscription_events.user_id IS 'Reference to the user for easy access to user details';
COMMENT ON COLUMN subscription_events.event_type IS 'Type of subscription event (created, updated, canceled, etc.)';
COMMENT ON COLUMN subscription_events.data IS 'JSON data containing full event details';
COMMENT ON COLUMN subscription_events.status IS 'Status of the event processing';
COMMENT ON COLUMN subscription_events.error_message IS 'Error message if event processing failed';
COMMENT ON COLUMN subscription_events.created_at IS 'Timestamp when the event was created';
COMMENT ON COLUMN subscription_events.updated_at IS 'Timestamp when the event was last updated';

-- Enable RLS and create policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view their own profile" ON "public"."users"
FOR SELECT TO authenticated
USING (clerk_user_id = (SELECT auth.jwt()->>'sub'));
CREATE POLICY "Users must insert their own profile" ON "public"."users"
AS PERMISSIVE FOR INSERT TO authenticated
WITH CHECK (clerk_user_id = (SELECT auth.jwt()->>'sub'));
CREATE POLICY "Users can update their own profile" ON "public"."users"
FOR UPDATE TO authenticated
USING (clerk_user_id = (SELECT auth.jwt()->>'sub'));

ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view facilities" ON "public"."facilities"
FOR SELECT TO authenticated
USING (true);

ALTER TABLE miners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view miners" ON "public"."miners"
FOR SELECT TO authenticated
USING (true);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view active payment methods" ON "public"."payment_methods"
FOR SELECT TO authenticated
USING (is_active = true);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view plans" ON "public"."plans"
FOR SELECT TO authenticated
USING (true);

ALTER TABLE hosting ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view hosting" ON "public"."hosting"
FOR SELECT TO authenticated
USING (true);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view their own transactions" ON "public"."transactions"
FOR SELECT TO authenticated
USING (user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')));
CREATE POLICY "Users must insert their own transactions" ON "public"."transactions"
AS PERMISSIVE FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')));

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view their own subscriptions" ON "public"."subscriptions"
FOR SELECT TO authenticated
USING (user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')));
CREATE POLICY "User can update their own subscriptions" ON "public"."subscriptions"
FOR UPDATE TO authenticated
USING (user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')));

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view their own orders" ON "public"."orders"
FOR SELECT TO authenticated
USING (user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')));
CREATE POLICY "Users must insert their own orders" ON "public"."orders"
AS PERMISSIVE FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')));
CREATE POLICY "User can update their own orders" ON "public"."orders"
FOR UPDATE TO authenticated
USING (user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')));

ALTER TABLE subscription_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view their own subscription sessions" ON "public"."subscription_sessions"
FOR SELECT TO authenticated
USING (user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')));

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own survey responses" ON "public"."survey_responses"
FOR SELECT TO authenticated
USING (user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')));
CREATE POLICY "Users can insert their own survey responses" ON "public"."survey_responses"
FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')));
CREATE POLICY "Anonymous users can submit surveys" ON "public"."survey_responses"
FOR INSERT TO anon
WITH CHECK (user_id IS NULL);
CREATE POLICY "Service role can view all survey responses" ON "public"."survey_responses"
FOR SELECT TO service_role
USING (true);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view their own notifications" ON "public"."notifications"
FOR SELECT TO authenticated
USING (user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')));

ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can view payment attempts" ON "public"."payment_attempts"
FOR SELECT TO service_role
USING (true);

-- Insert sample data
INSERT INTO payment_methods (name, display_name, is_active, requires_crypto_address, config) VALUES
('stripe', 'Credit Card (Stripe)', TRUE, FALSE, '{"webhook_endpoint": "/api/webhooks/stripe-webhook"}'),
('nowpayments', 'Crypto (NOWPayments))', TRUE, TRUE, '{"webhook_endpoint": "/api/webhooks/nowpayments-webhook"}');

INSERT INTO facilities (name) VALUES
('Ethiopia'), ('Dubai'), ('Texas'), ('Finland'), ('Paraguay'), ('Georgia');

INSERT INTO miners (name) VALUES
('Antminer S21');

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM miners WHERE name = 'Antminer S21') THEN
    WITH miner AS (SELECT id FROM miners WHERE name = 'Antminer S21'),
    plan_data AS (
      SELECT hashrate, price, facility_name
      FROM (
        VALUES
          (100, 150.00, 'Ethiopia'),
          (300, 450.00, 'Dubai'),
          (500, 750.00, 'Texas'),
          (1000, 150.00, 'Finland'),
          (1500, 2250.00, 'Paraguay'),
          (2000, 3000.00, 'Georgia'),
          (2500, 3750.00, 'Georgia'),
          (3000, 4500.00, 'Georgia')
      ) AS t(hashrate, price, facility_name)
    )
    INSERT INTO plans (type, hashrate, price, currency, duration, miner_id, facility_id, stripe_price_id, bitpay_item_code)
    SELECT
      'hashrate',
      pd.hashrate,
      pd.price,
      'USD',
      'Monthly Recurring',
      miner.id,
      f.id,
      'price_' || LOWER(REPLACE(f.name, ' ', '_')) || '_' || pd.hashrate,
      'bitpay_' || LOWER(REPLACE(f.name, ' ', '_')) || '_' || pd.hashrate
    FROM plan_data pd
    JOIN facilities f ON f.name = pd.facility_name
    CROSS JOIN miner;
  ELSE
    RAISE NOTICE 'Miner "Antminer S21" not found, skipping plans insert';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM miners WHERE name = 'Antminer S21') THEN
    WITH miner AS (SELECT id FROM miners WHERE name = 'Antminer S21')
    INSERT INTO hosting (miner_id, facility_id, price, currency, duration, stripe_price_id, bitpay_item_code)
    SELECT
      miner.id,
      f.id,
      CASE
        WHEN f.name = 'Ethiopia' THEN 80.00
        WHEN f.name = 'Dubai' THEN 120.00
        WHEN f.name = 'Texas' THEN 100.00
        WHEN f.name = 'Finland' THEN 110.00
        WHEN f.name = 'Paraguay' THEN 90.00
        WHEN f.name = 'Georgia' THEN 95.00
      END,
      'USD',
      'Monthly Recurring',
      'hosting_price_' || LOWER(REPLACE(f.name, ' ', '_')),
      'hosting_bitpay_' || LOWER(REPLACE(f.name, ' ', '_'))
    FROM facilities f, miner;
  ELSE
    RAISE NOTICE 'Miner "Antminer S21" not found, skipping hosting insert';
  END IF;
END $$;

-- Create view
CREATE VIEW subscription_summary AS
SELECT
  f.name AS facility,
  p.hashrate,
  COUNT(s.id) AS active_subscriptions,
  SUM(p.price) AS total_revenue
FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
JOIN facilities f ON p.facility_id = f.id
WHERE s.status = 'active'
GROUP BY f.name, p.hashrate;

-- Optional: Materialized view for performance (commented out)
-- CREATE MATERIALIZED VIEW subscription_summary_materialized AS
-- SELECT
--   f.name AS facility,
--   p.hashrate,
--   COUNT(s.id) AS active_subscriptions,
--   SUM(p.price) AS total_revenue
-- FROM subscriptions s
-- JOIN plans p ON s.plan_id = p.id
-- JOIN facilities f ON p.facility_id = f.id
-- WHERE s.status = 'active'
-- GROUP BY f.name, p.hashrate;
-- CREATE UNIQUE INDEX idx_subscription_summary_materialized ON subscription_summary_materialized(facility, hashrate);

-- Create or update the users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL, -- Maps to Clerk's `sub` claim
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'regular', -- Possible values: 'admin', 'client', 'regular'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can view their own profile

-- RLS policy: Admins can view and manage all users
CREATE POLICY "Admins can manage users" ON users
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin')
WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Ensure RLS is enabled on all tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- RLS policies for plans


CREATE POLICY "Admins can manage plans" ON plans
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin')
WITH CHECK (auth.jwt()->>'role' = 'admin');

-- RLS policies for transactions
CREATE POLICY "Clients can view transactions" ON transactions
FOR SELECT TO authenticated
USING (auth.jwt()->>'role' IN ('client', 'admin'));

CREATE POLICY "Admins can manage transactions" ON transactions
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin')
WITH CHECK (auth.jwt()->>'role' = 'admin');

-- RLS policies for orders
CREATE POLICY "Regular users can view their orders" ON orders
FOR SELECT TO authenticated
USING (user_id = (SELECT id FROM users WHERE clerk_user_id = auth.jwt()->>'sub'));

CREATE POLICY "Clients can view all orders" ON orders
FOR SELECT TO authenticated
USING (auth.jwt()->>'role' IN ('client', 'admin'));

CREATE POLICY "Admins can manage orders" ON orders
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin')
WITH CHECK (auth.jwt()->>'role' = 'admin');

-- RLS policies for facilities
CREATE POLICY "Clients can view facilities" ON facilities
FOR SELECT TO authenticated
USING (auth.jwt()->>'role' IN ('client', 'admin'));

CREATE POLICY "Admins can manage facilities" ON facilities
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin')
WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

CREATE POLICY "Users can view their own profile" ON users
FOR SELECT TO authenticated
USING (clerk_user_id = auth.jwt()->>'sub');

CREATE POLICY "Admins can manage all users" ON users
FOR ALL TO authenticated
USING ((auth.jwt()->'public_metadata'->>'role') = 'admin')
WITH CHECK ((auth.jwt()->'public_metadata'->>'role') = 'admin');

-- Plans table
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read plans" ON plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON plans;

CREATE POLICY "Authenticated users can read plans" ON plans
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage plans" ON plans
FOR ALL TO authenticated
USING ((auth.jwt()->'public_metadata'->>'role') = 'admin')
WITH CHECK ((auth.jwt()->'public_metadata'->>'role') = 'admin');