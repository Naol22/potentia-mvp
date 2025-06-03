"use server";

import { NextResponse } from "next/server";
import { createClientSupabaseClient } from "@/lib/supabase";
import { Transaction, PaymentType, TransactionStatus, CurrencyCode, PlanType } from "@/types";

type TransactionRequest = {
  action: "create" | "update";
  transaction: Partial<Transaction>;
};

export async function POST(request: Request) {
  const client = createClientSupabaseClient();

  try {
    console.log("[Update Transaction API] Processing transaction in Supabase...");
    const { action, transaction } = (await request.json()) as TransactionRequest;

    if (!action || !transaction) {
      console.error("[Update Transaction API] Error processing transaction:", {
        message: "Missing action or transaction data",
        details: "Both action and transaction are required fields",
        code: "MISSING_FIELDS",
      });
      throw new Error("Missing action or transaction data");
    }

    if (action === "create") {
      if (!transaction.plan_type || !["hashrate", "hosting"].includes(transaction.plan_type)) {
        throw new Error("Invalid or missing plan_type");
      }
      if (!transaction.plan_id) {
        throw new Error("Missing plan_id");
      }
      if (!transaction.payment_type || !["one_time", "subscription"].includes(transaction.payment_type)) {
        throw new Error("Invalid or missing payment_type");
      }
      if (typeof transaction.amount !== "number" || transaction.amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      if (!transaction.currency || !["USD", "EUR", "BTC"].includes(transaction.currency)) {
        throw new Error("Invalid or missing currency");
      }
      if (!transaction.status || !["pending", "completed", "failed", "cancelled"].includes(transaction.status)) {
        throw new Error("Invalid or missing status");
      }
    }

    if (action === "create") {
      const { data, error } = await client
        .from("transactions")
        .insert({
          user_id: transaction.user_id || null,
          plan_type: transaction.plan_type as PlanType,
          plan_id: transaction.plan_id,
          payment_type: transaction.payment_type as PaymentType,
          amount: transaction.amount,
          currency: transaction.currency as CurrencyCode,
          status: transaction.status as TransactionStatus,
          payment_method_id: transaction.payment_method_id || null,
          payment_provider_reference: transaction.payment_provider_reference || null,
          subscription_id: transaction.subscription_id || null,
          checkout_session_id: transaction.checkout_session_id || null,
          metadata: transaction.metadata || null,
          created_at: transaction.created_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("[Update Transaction API] Error creating transaction:", {
          message: error.message,
          details: error.details,
          code: error.code,
        });
        throw new Error("Failed to create transaction");
      }

      console.log("[Update Transaction API] Successfully created transaction:", data);
      return NextResponse.json({ transaction: data });
    } else if (action === "update") {
      if (!transaction.id) {
        console.error("[Update Transaction API] Error updating transaction:", {
          message: "Missing transaction ID",
          details: "Transaction ID is required for updates",
          code: "MISSING_ID",
        });
        throw new Error("Missing transaction ID");
      }

      const { data, error } = await client
        .from("transactions")
        .update({
          user_id: transaction.user_id || null,
          plan_type: transaction.plan_type as PlanType,
          plan_id: transaction.plan_id,
          payment_type: transaction.payment_type as PaymentType,
          amount: transaction.amount,
          currency: transaction.currency as CurrencyCode,
          status: transaction.status as TransactionStatus,
          payment_method_id: transaction.payment_method_id || null,
          payment_provider_reference: transaction.payment_provider_reference || null,
          subscription_id: transaction.subscription_id || null,
          checkout_session_id: transaction.checkout_session_id || null,
          metadata: transaction.metadata || null,
        })
        .eq("id", transaction.id)
        .select()
        .single();

      if (error) {
        console.error("[Update Transaction API] Error updating transaction:", {
          message: error.message,
          details: error.details,
          code: error.code,
        });
        throw new Error("Failed to update transaction");
      }

      console.log("[Update Transaction API] Successfully updated transaction:", data);
      return NextResponse.json({ transaction: data });
    }

    throw new Error("Invalid action");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[Update Transaction API] Error processing transaction:", {
        message: error.message,
        stack: error.stack,
      });
      return NextResponse.json(
        {
          error: "Internal Server Error",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: "Unknown error",
      },
      { status: 500 }
    );
  }
}
