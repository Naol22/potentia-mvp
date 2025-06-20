"use client"

import { useEffect, useState } from "react"
import { TransactionStatus, PaymentType, CurrencyCode, PlanType } from "../types"

export type Transaction = {
  id: string;
  user_id: string | null;
  plan_type: PlanType;
  plan_id: string;
  payment_type: PaymentType;
  amount: number;
  currency: CurrencyCode;
  status: TransactionStatus;
  payment_method_id?: string | null;
  payment_provider_reference?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  subscription_id?: string | null;
  checkout_session_id?: string | null;
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

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/transactions");
        const json = await res.json();
        if (res.ok) {
          const formattedTransactions: Transaction[] = (json ?? []);
          setTransactions(formattedTransactions);

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
        } else {
          setError(json.error || "Failed to fetch transactions");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching transactions')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  return { transactions, stats, loading, error }
}