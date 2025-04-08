-- Create users table that connects with Clerk
CREATE TABLE users (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create plans table (moved up)
CREATE TABLE plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name text NOT NULL,
  price decimal NOT NULL,
  duration text NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  price_id text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create transactions table (moved after plans)
CREATE TABLE transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES plans(id) ON DELETE RESTRICT NOT NULL,
  amount decimal NOT NULL,
  status text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_plans junction table
CREATE TABLE user_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES plans(id) ON DELETE RESTRICT NOT NULL,
  transaction_id uuid REFERENCES transactions(id) ON DELETE RESTRICT NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX transactions_user_id_idx ON transactions(user_id);
CREATE INDEX user_plans_user_id_idx ON user_plans(user_id);
CREATE INDEX user_plans_plan_id_idx ON user_plans(plan_id);
CREATE INDEX user_plans_transaction_id_idx ON user_plans(transaction_id);
CREATE INDEX transactions_plan_id_idx ON transactions(plan_id);