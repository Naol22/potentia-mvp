-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for status and type fields
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'unpaid');
CREATE TYPE order_status AS ENUM ('pending', 'active', 'canceled', 'expired');
CREATE TYPE plan_type AS ENUM ('hashrate', 'hosting', 'custom');

-- Create trigger function for updating updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create tables
-- Users table
COMMENT ON TABLE users IS 'Stores user profiles linked to Clerk authentication';
COMMENT ON COLUMN users.clerk_user_id IS 'Unique user ID from Clerk authentication provider';
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL DEFAULT auth.jwt()->>'sub',
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facilities table
COMMENT ON TABLE facilities IS 'Stores mining facility locations';
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Miners table
COMMENT ON TABLE miners IS 'Stores mining hardware details';
CREATE TABLE miners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
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
  currency TEXT NOT NULL DEFAULT 'USD',
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
  currency TEXT NOT NULL DEFAULT 'USD',
  duration TEXT NOT NULL DEFAULT 'Monthly Recurring',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_price CHECK (price > 0)
);

-- Transactions table
COMMENT ON TABLE transactions IS 'Stores payment transactions for plans';
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
COMMENT ON TABLE orders IS 'Stores user orders for plans or services';
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  miner_id UUID REFERENCES miners(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  crypto_address TEXT,
  status order_status NOT NULL DEFAULT 'pending',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT FALSE,
  auto_renew BOOLEAN DEFAULT FALSE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
-- Subscription events table
CREATE TABLE subscription_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX idx_subscription_events_subscription_id ON subscription_events(subscription_id);
CREATE INDEX idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX idx_subscription_events_event_type ON subscription_events(event_type);
CREATE INDEX idx_subscription_events_created_at ON subscription_events(created_at);

-- Add trigger for updated_at
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON subscription_events
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE subscription_events IS 'Tracks all subscription-related events and changes';
COMMENT ON COLUMN subscription_events.id IS 'Unique identifier for the event';
COMMENT ON COLUMN subscription_events.subscription_id IS 'Reference to the subscription';
COMMENT ON COLUMN subscription_events.user_id IS 'Reference to the user for easy access to user details';
COMMENT ON COLUMN subscription_events.event_type IS 'Type of subscription event (created, updated, canceled, etc.)';
COMMENT ON COLUMN subscription_events.data IS 'JSON data containing full event details';
COMMENT ON COLUMN subscription_events.created_at IS 'Timestamp when the event was created';
COMMENT ON COLUMN subscription_events.updated_at IS 'Timestamp when the event was last updated';

-- Enable RLS and create policies (Moved: Grouped together for clarity)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view their own profile"
ON "public"."users"
FOR SELECT
TO authenticated
USING (
  clerk_user_id = (SELECT auth.jwt()->>'sub')
);
CREATE POLICY "Users must insert their own profile"
ON "public"."users"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  clerk_user_id = (SELECT auth.jwt()->>'sub')
);
CREATE POLICY "Users can update their own profile"
ON "public"."users"
FOR UPDATE
TO authenticated
USING (
  clerk_user_id = (SELECT auth.jwt()->>'sub')
);

ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view facilities"
ON "public"."facilities"
FOR SELECT
TO authenticated
USING (true);

ALTER TABLE miners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view miners"
ON "public"."miners"
FOR SELECT
TO authenticated
USING (true);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view active payment methods"
ON "public"."payment_methods"
FOR SELECT
TO authenticated
USING (is_active = true);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view plans"
ON "public"."plans"
FOR SELECT
TO authenticated
USING (true);

ALTER TABLE hosting ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view hosting"
ON "public"."hosting"
FOR SELECT
TO authenticated
USING (true);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view their own transactions"
ON "public"."transactions"
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub'))
);
CREATE POLICY "Users must insert their own transactions"
ON "public"."transactions"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub'))
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view their own subscriptions"
ON "public"."subscriptions"
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub'))
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view their own orders"
ON "public"."orders"
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub'))
);
CREATE POLICY "Users must insert their own orders"
ON "public"."orders"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub'))
);

ALTER TABLE subscription_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view their own subscription sessions"
ON "public"."subscription_sessions"
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub'))
);

-- Create indexes (Moved: Grouped together for clarity)
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
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_plan_id ON orders(plan_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Create triggers (Moved: Grouped together for clarity)
CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO payment_methods (name, display_name, is_active, requires_crypto_address, config) VALUES
('stripe', 'Credit Card (Stripe)', TRUE, FALSE, '{"webhook_endpoint": "/api/webhooks/stripe-webhook"}'),
('bitpay', 'Bitcoin (BitPay)', TRUE, TRUE, '{"webhook_endpoint": "/api/webhooks/bitpay-webhook"}');

INSERT INTO facilities (name) VALUES
('Ethiopia'),
('Dubai'),
('Texas'),
('Finland'),
('Paraguay'),
('Georgia');

INSERT INTO miners (name) VALUES
('Antminer S21');

-- Modified: Added dependency check for plans insert
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM miners WHERE name = 'Antminer S21') THEN
    WITH miner AS (SELECT id FROM miners WHERE name = 'Antminer S21'),
    plan_data AS (
      SELECT
        hashrate,
        price,
        facility_name
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

-- Modified: Added dependency check for hosting insert
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM miners WHERE name = 'Antminer S21') THEN
    WITH miner AS (SELECT id FROM miners WHERE name = 'Antminer S21')
    INSERT INTO hosting (miner_id, facility_id, price, currency, duration)
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
      'Monthly Recurring'
    FROM facilities f, miner;
  ELSE
    RAISE NOTICE 'Miner "Antminer S21" not found, skipping hosting insert';
  END IF;
END $$;

-- Create view (Moved: After sample data for workflow alignment)
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


-- After the subscription_summary view creation

-- Survey responses table
COMMENT ON TABLE survey_responses IS 'Stores user feedback and satisfaction ratings';
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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

-- Add comments to columns
COMMENT ON COLUMN survey_responses.id IS 'Unique identifier for the survey response';
COMMENT ON COLUMN survey_responses.user_id IS 'Reference to the user who submitted the response (optional)';
COMMENT ON COLUMN survey_responses.satisfaction IS 'Satisfaction rating from 1-5';
COMMENT ON COLUMN survey_responses.completed IS 'Whether the survey was fully completed';
COMMENT ON COLUMN survey_responses.issue IS 'Description of any issues reported';
COMMENT ON COLUMN survey_responses.suggestion IS 'User suggestions for improvement';
COMMENT ON COLUMN survey_responses.nps IS 'Net Promoter Score (0-10)';
COMMENT ON COLUMN survey_responses.metadata IS 'Additional survey data in JSON format';
COMMENT ON COLUMN survey_responses.created_at IS 'Timestamp when the survey was submitted';

-- Create indexes for performance
CREATE INDEX idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX idx_survey_responses_satisfaction ON survey_responses(satisfaction);
CREATE INDEX idx_survey_responses_completed ON survey_responses(completed);
CREATE INDEX idx_survey_responses_nps ON survey_responses(nps);
CREATE INDEX idx_survey_responses_created_at ON survey_responses(created_at);

-- Enable RLS and create policies
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Users can view their own survey responses
CREATE POLICY "Users can view their own survey responses"
ON "public"."survey_responses"
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub'))
);

-- Users can insert their own survey responses
CREATE POLICY "Users can insert their own survey responses"
ON "public"."survey_responses"
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub'))
);

-- Anonymous users can submit surveys without authentication
CREATE POLICY "Anonymous users can submit surveys"
ON "public"."survey_responses"
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
);

-- Service role can view all survey responses (for analytics)
CREATE POLICY "Service role can view all survey responses"
ON "public"."survey_responses"
FOR SELECT
TO service_role
USING (true);