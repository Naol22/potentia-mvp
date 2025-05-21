"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/utils/supaBaseClient"

type Transaction = {
  id: string
  user_id: string
  stripe_transaction_id: string
  amount: number
  status: string
  created_at: string
}

type TransactionStats = {
  totalTransactions: number
  totalAmount: number
  completedTransactions: number
  pendingTransactions: number
  failedTransactions: number
  averageAmount: number
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
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        console.log('Raw data from Supabase:', data)

        const formattedTransactions: Transaction[] = data.map((transaction: any) => ({
          id: transaction.id,
          clerk_user_id: transaction.user_id,
          stripe_transaction_id: transaction.id,
          amount: transaction.amount,
          status: transaction.status,
          created_at: transaction.created_at
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
  }, [])

  return { transactions, stats, loading, error }
}