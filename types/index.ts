/**
 * Enum for transaction status values
 */
export enum TransactionStatus {
    Pending = "pending",
    Completed = "completed",
    Failed = "failed",
    Refunded = "refunded",
  }
  
  /**
   * Enum for subscription status values
   */
  export enum SubscriptionStatus {
    Active = "active",
    PastDue = "past_due",
    Canceled = "canceled",
    Unpaid = "unpaid",
  }
  
  /**
   * Enum for order status values
   */
  export enum OrderStatus {
    Pending = "pending",
    Active = "active",
    Canceled = "canceled",
    Expired = "expired",
  }
  
  /**
   * Enum for plan type values
   */
  export enum PlanType {
    Hashrate = "hashrate",
    Hosting = "hosting",
    Custom = "custom",
  }
  
  /**
   * Enum for currency code values
   */
  export enum CurrencyCode {
    USD = "USD",
    EUR = "EUR",
    BTC = "BTC",
  }
  
  /**
   * Interface for facility/miner details stored as JSONB
   */
  export interface Details {
    location?: string;
    specs?: {
      power?: number;
      capacity?: number;
      [key: string]: string | number | boolean | undefined;
    };
    [key: string]: string | number | boolean | Details | undefined;
  }
  
  /**
   * Interface for payment provider configuration stored as JSONB
   */
  export interface PaymentConfig {
    apiKey?: string;
    endpoint?: string;
    [key: string]: string | number | boolean | undefined;
  }
  
  /**
   * Stores user profiles linked to Clerk authentication
   */
  export interface User {
    id: string;
    clerk_user_id: string; // Unique user ID from Clerk authentication provider
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    email?: string | null;
    stripe_customer_id?: string | null;
    btc_address?: string | null; // Must match regex ^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$
    created_at: string; // ISO 8601 timestamp
  }
  
  /**
   * Stores mining facility locations
   */
  export interface Facility {
    id: string;
    name: string;
    details?: Details | null; // JSONB
    created_at: string;
  }
  
  /**
   * Stores mining hardware details
   */
  export interface Miner {
    id: string;
    name: string;
    details?: Details | null; // JSONB
    created_at: string;
  }
  
  /**
   * Stores payment provider configurations
   */
  export interface PaymentMethod {
    id: string;
    name: string; // Unique
    display_name: string;
    is_active: boolean;
    requires_crypto_address: boolean;
    config?: PaymentConfig | null; // JSONB
    created_at: string;
    updated_at: string;
  }
  
  /**
   * Defines hashrate-based mining plans with pricing and facility details
   */
  export interface Plan {
    id: string;
    type: PlanType;
    hashrate: number; // Must be > 0
    price: number; // Must be > 0
    currency: CurrencyCode;
    duration: string;
    miner_id?: string | null; // References Miner
    facility_id?: string | null; // References Facility
    stripe_price_id?: string | null;
    bitpay_item_code?: string | null;
    is_subscription: boolean;
    created_at: string;
  }
  
  /**
   * Stores hosting service details for miners
   */
  export interface Hosting {
    id: string;
    miner_id?: string | null; // References Miner
    facility_id?: string | null; // References Facility
    price: number; // Must be > 0
    currency: CurrencyCode;
    duration: string;
    stripe_price_id?: string | null;
    bitpay_item_code?: string | null;
    created_at: string;
  }
  
  /**
   * Stores payment transactions for plans
   */
  export interface Transaction {
    id: string;
    user_id?: string; // References User
    plan_id?: string | null; // References Plan
    subscription_id?: string | null; // References Subscription
    amount: number; // Must be > 0
    currency: CurrencyCode;
    status: TransactionStatus;
    description?: string | null;
    payment_method_id?: string | null; // References PaymentMethod
    payment_provider_reference?: string | null;
    metadata?: Record<string, string | number | boolean> | null; // JSONB
    created_at: string;
  }
  
  /**
   * Stores recurring subscription details
   */
  export interface Subscription {
    id: string;
    user_id?: string; // References User
    plan_id?: string | null; // References Plan
    status: SubscriptionStatus;
    payment_method_id?: string | null; // References PaymentMethod
    provider_subscription_id?: string | null;
    current_period_start?: string | null;
    current_period_end?: string | null; // Must be >= current_period_start
    cancel_at_period_end: boolean;
    canceled_at?: string | null;
    created_at: string;
    updated_at: string;
  }
  
  /**
   * Stores user orders for plans or services
   */
  export interface Order {
    id: string;
    user_id?: string; // References User
    plan_id?: string | null; // References Plan
    transaction_id?: string | null; // References Transaction
    subscription_id?: string | null; // References Subscription
    crypto_address?: string | null; // Must match regex ^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$
    status: OrderStatus;
    start_date?: string | null;
    end_date?: string | null; // Must be >= start_date
    is_active: boolean;
    auto_renew: boolean;
    next_billing_date?: string | null;
    created_at: string;
  }
  
  /**
   * Stores secure session links for subscription management
   */
  export interface SubscriptionSession {
    id: string;
    user_id?: string; // References User
    subscription_id?: string; // References Subscription
    session_url: string;
    session_token: string;
    expires_at: string;
    is_used: boolean;
    created_at: string;
  }
  
  /**
   * Stores subscription event logs
   */
  export interface SubscriptionEvent {
    id: string;
    subscription_id: string; // References Subscription
    user_id: string; // References User
    event_type: string; // VARCHAR(50)
    data: unknown; // JSONB, varies based on event (e.g., Stripe payload)
    status: string;
    error_message?: string | null;
    created_at: string;
    updated_at: string;
  }
  
  /**
   * Stores user feedback and satisfaction ratings
   */
  export interface SurveyResponse {
    id: string;
    user_id?: string | null; // References User
    anonymous_user_id: string;
    satisfaction: number; // Must be between 1 and 5
    completed: boolean;
    issue?: string | null;
    suggestion?: string | null;
    nps?: number | null; // Must be between 0 and 10
    metadata?: Record<string, string | number | boolean> | null; // JSONB
    created_at: string;
  }
  
  /**
   * Stores user notifications
   */
  export interface Notification {
    id: string;
    user_id?: string; // References User
    subscription_id?: string | null; // References Subscription
    type: string;
    message: string;
    status: string;
    created_at: string;
    sent_at?: string | null;
  }
  
  /**
   * Stores payment attempt logs
   */
  export interface PaymentAttempt {
    id: string;
    subscription_id?: string; // References Subscription
    transaction_id?: string | null; // References Transaction
    payment_method_id?: string | null; // References PaymentMethod
    amount: number;
    status: string;
    error_message?: string | null;
    created_at: string;
  }