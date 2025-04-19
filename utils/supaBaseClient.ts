import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for your tables
export type User = {
  id: string  // This will match the Clerk user ID
  email: string
  created_at: string
  updated_at: string
}

export type Transaction = {
  id: string
  user_id: string // Foreign key to users table
  plan_id: string // Foreign key to plans table
  amount: number
  status: string
  created_at: string
  description: string
}

// Modified Plan type without user_id
export type Plan = {
  id: string
  plan_name: string
  price: number
  duration: string  // e.g., "30d", "1y", etc.
  features: string[]
  price_id: string  // Stripe price ID
  active: boolean   // Default false
  created_at: string
}

// Junction table to associate users with plans
export type UserPlan = {
  id: string
  user_id: string   // Foreign key to users table
  plan_id: string   // Foreign key to plans table
  transaction_id: string // Reference to the transaction
  start_date: string // Will be set to transaction date
  end_date: string   // Will be calculated based on plan duration

  created_at: string
}