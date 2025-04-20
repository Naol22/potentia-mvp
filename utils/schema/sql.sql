CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL DEFAULT auth.jwt()->>'sub',
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can view their own profile"
ON "public"."users"
FOR SELECT
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = (clerk_user_id)::text)
);

CREATE POLICY "Users must insert their own profile"
ON "public"."users"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  ((SELECT auth.jwt()->>'sub') = (clerk_user_id)::text)
);

CREATE POLICY "Users can update their own profile"
ON "public"."users"
FOR UPDATE
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = (clerk_user_id)::text)
);

CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE miners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL DEFAULT 'hashrate',
  hashrate INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration TEXT NOT NULL DEFAULT 'Monthly Recurring',
  miner_id UUID REFERENCES miners(id) ON DELETE SET NULL,
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hosting (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  miner_id UUID REFERENCES miners(id) ON DELETE SET NULL,
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration TEXT NOT NULL DEFAULT 'Monthly Recurring',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can view their own transactions"
ON "public"."transactions"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = transactions.user_id
    AND users.clerk_user_id = (SELECT auth.jwt()->>'sub')
  )
);

CREATE POLICY "Users must insert their own transactions"
ON "public"."transactions"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = transactions.user_id
    AND users.clerk_user_id = (SELECT auth.jwt()->>'sub')
  )
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  miner_id UUID REFERENCES miners(id) ON DELETE SET NULL,
  btc_address TEXT NOT NULL,
  stripe_payment_id TEXT,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can view their own orders"
ON "public"."orders"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = orders.user_id
    AND users.clerk_user_id = (SELECT auth.jwt()->>'sub')
  )
);

CREATE POLICY "Users must insert their own orders"
ON "public"."orders"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = orders.user_id
    AND users.clerk_user_id = (SELECT auth.jwt()->>'sub')
  )
);

INSERT INTO facilities (name) VALUES
('Ethiopia'),
('Dubai'),
('Texas'),
('Finland'),
('Paraguay'),
('Georgia');

INSERT INTO miners (name) VALUES
('Antminer S21');

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
      (1000, 1500.00, 'Finland'),
      (1500, 2250.00, 'Paraguay'),
      (2000, 3000.00, 'Georgia'),
      (2500, 3750.00, 'Georgia'),
      (3000, 4500.00, 'Georgia')
  ) AS t(hashrate, price, facility_name)
)
INSERT INTO plans (type, hashrate, price, duration, miner_id, facility_id)
SELECT
  'hashrate',
  pd.hashrate,
  pd.price,
  'Monthly Recurring',
  miner.id,
  f.id
FROM plan_data pd
JOIN facilities f ON f.name = pd.facility_name
CROSS JOIN miner;

WITH miner AS (SELECT id FROM miners WHERE name = 'Antminer S21')
INSERT INTO hosting (miner_id, facility_id, price, duration)
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
  'Monthly Recurring'
FROM facilities f, miner;
/*
- **User-Specific Tables** (`users`, `orders`, `transactions`):
    - Secured with RLS policies to ensure users can only access their own data.
    - `users.clerk_user_id` defaults to `auth.jwt()->>'sub'` to tie records to the Clerk user ID.
- **Global Tables** (`facilities`, `miners`, `plans`, `hosting`):
    - No RLS, as these are shared resources accessible to all authenticated users.
*/