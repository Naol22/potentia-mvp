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
