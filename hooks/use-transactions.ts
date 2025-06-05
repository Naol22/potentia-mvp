"use client"

import { useEffect, useState } from "react"

import { createClientSupabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@clerk/nextjs";

// Match the actual transactions table schema
export type Transaction = {
  id: string;
  user_id: string;
  plan_type: string;
  plan_id: string;
  payment_type: string;
  amount: number;
  currency: string;
  status: string;
  payment_method_id?: string;
  payment_provider_reference?: string;
  metadata?: any;
  created_at: string;
  subscription_id?: string;
  checkout_session_id?: string;
};

type TransactionStats = {
  totalTransactions: number;
  totalAmount: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  averageAmount: number;
}

export function useTransactions() {
  const { userId, isLoaded: isAuthLoaded, getToken } = useAuth();
  const [client, setClient] = useState(createClientSupabaseClient());

  useEffect(() => {
    async function updateClient() {
      const token = await getToken({ template: "supabase" });
      setClient(createClientSupabaseClient(token));
    }
    if (isAuthLoaded) {
      updateClient();
    }
  }, [isAuthLoaded, getToken]);
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    totalAmount: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    averageAmount: 0,
  })
  const sampleTransaction: Transaction = {
    id: "txn_1234567890", // Unique transaction ID
    user_id: "user_abc123", // Example user ID from Clerk or Supabase
    plan_type: "hashrate", // Type of plan (e.g., hashrate subscription)
    plan_id: "9b654b77-94fd-4e20-9903-17edcb318b1c", // Example plan ID from your error
    payment_type: "crypto", // Payment type (e.g., cryptocurrency)
    amount: 450, // Amount in USD (e.g., 3000TH hashrate plan)
    currency: "USD", // Currency code
    status: "pending", // Current status of the transaction
    payment_method_id: "pm_987654321", // Payment method ID from NOWPayments or Stripe
    payment_provider_reference: "Crypto payment for plan 9b654b77-94fd-4e20-9903-17edcb318b1c", // Reference from payment provider
    metadata: { note: "Initial subscription payment" }, // Optional metadata
    created_at: "2025-06-05T10:03:00Z", // Timestamp matching current date and time (10:03 AM EAT)
    subscription_id: "sub_456789", // Optional subscription ID for recurring payments
    checkout_session_id: "cs_123456", // Optional Stripe checkout session ID
  };

  useEffect(() => {
    if (!isAuthLoaded) return;
    
    console.log('[useTransactions] Hook mounted, userId:', userId)
    console.log('[useTransactions] useEffect triggered, userId:', userId)
    async function fetchTransactions() {
      try {
        setLoading(true)
        setError(null)
        if (!userId) {
          setTransactions([]);
          setStats({
            totalTransactions: 0,
            totalAmount: 0,
            completedTransactions: 0,
            pendingTransactions: 0,
            failedTransactions: 0,
            averageAmount: 0,
          });
          setLoading(false);
          return;
        }

        const { data: transactions, error: planError } = await client
          .from('transactions')
          .select('*')
          // .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        console.log('Raw data from Supabase:', transactions)
        console.log('Error: ', planError)

        const formattedTransactions: Transaction[] = (transactions ?? []).map((transaction: any) => ({
          id: transaction.id,
          user_id: transaction.user_id,
          plan_type: transaction.plan_type,
          plan_id: transaction.plan_id,
          payment_type: transaction.payment_type,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          payment_method_id: transaction.payment_method_id,
          payment_provider_reference: transaction.payment_provider_reference,
          metadata: transaction.metadata,
          created_at: transaction.created_at,
          subscription_id: transaction.subscription_id,
          checkout_session_id: transaction.checkout_session_id,
        }))

        console.log('Formatted transactions:', formattedTransactions)

        setTransactions(formattedTransactions)

        // Calculate stats from real data
        const newStats = formattedTransactions.reduce(
          (acc, transaction) => {
            acc.totalTransactions++
            acc.totalAmount += transaction.amount

            switch (transaction.status) {
              case "completed":
                acc.completedTransactions++
                break
              case "pending":
                acc.pendingTransactions++
                break
              case "failed":
                acc.failedTransactions++
                break
            }

            return acc
          },
          {
            totalTransactions: 0,
            totalAmount: 0,
            completedTransactions: 0,
            pendingTransactions: 0,
            failedTransactions: 0,
            averageAmount: 0,
          } as TransactionStats
        )

        newStats.averageAmount =
          newStats.totalAmount / (newStats.totalTransactions || 1)

        setStats(newStats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching transactions')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [userId])

  return { transactions, stats, loading, error }
}