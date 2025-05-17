"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { Plan, Transaction, CurrencyCode, TransactionStatus } from "@/types";
import { motion } from "framer-motion";
import GlobalLoadingScreen from "@/components/GlobalLoadingScreen";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { Zap, Plug, Clock, Snowflake, Network } from "lucide-react";

const CheckoutPage: React.FC = () => {
  const searchParams = useSearchParams();
  const { getToken, userId } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "stripe" | "nowpayments" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const planId = searchParams.get("planId");

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) {
        setError("No plan ID provided");
        return;
      }
      setLoading(true);
      console.log("Attempting to fetch plan with ID:", planId);

      try {
        const response = await fetch(`/api/plans/${planId}`);
        console.log("API response status:", response.status);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${text}`
          );
        }
        const data = await response.json();
        console.log("Received plan data:", data);
        setPlan(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load plan details"
        );
        console.error("Plan fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  const validateCryptoAddress = (address: string): boolean => {
    const btcRegex =
      /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,59})$/;
    return btcRegex.test(address);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("You must be logged in to proceed");
      return;
    }

    if (!validateCryptoAddress(cryptoAddress)) {
      setError("Invalid cryptocurrency address");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Failed to retrieve authentication token");
      }

      const supabase = createClerkSupabaseClient(token);
      const { error: updateError } = await supabase
        .from("users")
        .update({ crypto_address: cryptoAddress })
        .eq("clerk_user_id", userId);

      if (updateError) {
        throw new Error(
          `Failed to update crypto address: ${updateError.message}`
        );
      }

      if (paymentMethod === "stripe") {
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            userId,
            btcAddress: cryptoAddress,
          }),
        });

        const { url } = await response.json();
        if (response.ok && url) {
          window.location.href = url;
        } else {
          throw new Error("Failed to initiate Stripe checkout");
        }
      } else {
        const nowPaymentsResponse = await fetch(
          "https://api.nowpayments.io/v1/invoice",
          {
            method: "POST",
            headers: {
              "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              price_amount: plan?.price,
              price_currency: plan?.currency.toLowerCase(),
              order_id: `order_${userId}_${planId}`,
              order_description: `Payment for plan ${plan?.type} - ${plan?.hashrate} TH/s`,
              ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`,
              success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
              cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
            }),
          }
        );

        const nowPaymentsData = await nowPaymentsResponse.json();
        if (nowPaymentsResponse.ok && nowPaymentsData.invoice_url) {
          const supabase = createClerkSupabaseClient(token);
          const transaction: Partial<Transaction> = {
            user_id: userId,
            plan_id: planId,
            amount: plan?.price,
            currency: plan?.currency as CurrencyCode,
            status: TransactionStatus.Pending,
            payment_method_id: nowPaymentsData.payment_id,
            description: `Crypto payment for plan ${planId}`,
            created_at: new Date().toISOString(),
          };

          const { error: transactionError } = await supabase
            .from("transactions")
            .insert(transaction);

          if (transactionError) {
            throw new Error(
              `Failed to record transaction: ${transactionError.message}`
            );
          }

          window.location.href = nowPaymentsData.invoice_url;
        } else {
          throw new Error("Failed to initiate NowPayments checkout");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during checkout"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!planId) {
    return <div className="text-center text-white">No plan ID provided</div>;
  }

  if (!plan) {
    return <GlobalLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white flex items-center justify-center p-6">
      {loading && <GlobalLoadingScreen />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-[150px] bg-neutral-800 rounded-xl shadow-lg p-8 max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Plan Overview</h1>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)} Plan
            </h2>
            <p className="text-lg">
              Hashrate: <span className="text-white">{plan.hashrate} TH/s</span>
            </p>
            <p className="text-lg">
              Price:{" "}
              <span className="text-white">
                ${plan.price} {plan.currency}
              </span>
            </p>
            <p className="text-lg">
              Duration: <span className="text-white">{plan.duration}</span>
            </p>
            <div className="bg-black p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Plan Specifications
              </h3>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <motion.div
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <Zap className="text-white h-5 w-5" />
                  <div>
                    <p className="font-medium text-white">Power Efficiency</p>
                    <p className="text-gray-400">
                      17.5 J/TH - Industry-leading performance
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <Plug className="text-white h-5 w-5" />
                  <div>
                    <p className="font-medium text-white">Power Consumption</p>
                    <p className="text-gray-400">
                      ~3500W per unit, optimized for cost
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <Clock className="text-white h-5 w-5" />
                  <div>
                    <p className="font-medium text-white">Uptime Guarantee</p>
                    <p className="text-gray-400">99.9% with 24/7 monitoring</p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <Snowflake className="text-white h-5 w-5" />
                  <div>
                    <p className="font-medium text-white">Cooling System</p>
                    <p className="text-gray-400">
                      Advanced air-cooling for reliability
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.3 }}
                >
                  <Network className="text-white h-5 w-5" />
                  <div>
                    <p className="font-medium text-white">Network Stability</p>
                    <p className="text-gray-400">
                      Optimized for low-latency mining
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
            <Tooltip id="plan-tooltip" place="right" className="solid" />
            <p
              data-tooltip-id="plan-tooltip"
              data-tooltip-content="This plan offers high-performance mining with scalable hashrate and facility-backed reliability."
              className="text-sm text-gray-400 hover:text-white cursor-pointer"
            >
              Learn more about this plan
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Details
          </h1>
          <form onSubmit={handleCheckout} className="space-y-6">
            <div>
              <label
                htmlFor="cryptoAddress"
                className="block text-lg font-medium text-white"
              >
                BTC Payout Address
              </label>
              <input
                id="cryptoAddress"
                type="text"
                value={cryptoAddress}
                onChange={(e) => setCryptoAddress(e.target.value)}
                className="mt-2 w-full px-4 py-3 bg-black border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition duration-300"
                placeholder="Enter your BTC address"
                required
              />
              <Tooltip id="btc-tooltip" place="top" className="solid" />
              <p
                data-tooltip-id="btc-tooltip"
                data-tooltip-content="Ensure your BTC address is valid (e.g., starts with 1, 3, or bc1) for payouts."
                className="text-sm text-gray-400 mt-1 hover:text-white cursor-pointer"
              >
                Address format help
              </p>
            </div>

            <div>
              <label className="block text-lg font-medium text-white mb-2">
                Price Summary
              </label>
              <div className="bg-black p-4 rounded-lg border border-neutral-700">
                <p className="text-lg">
                  Total:{" "}
                  <span className="text-white font-semibold">
                    ${plan.price} {plan.currency}
                  </span>
                </p>
                <p className="text-sm text-gray-400">
                  Monthly subscription until canceled
                </p>
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-white mb-2">
                Select Payment Method
              </label>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#ffffff" }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setPaymentMethod("stripe")}
                  className={`px-6 py-3 rounded-lg font-medium transition duration-300 ${
                    paymentMethod === "stripe"
                      ? "bg-black text-black border-4 border-black"
                      : "bg-white text-black"
                  }`}
                >
                  Stripe (Card)
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#ffffff" }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setPaymentMethod("nowpayments")}
                  className={`px-6 py-3 rounded-lg font-medium transition duration-300 ${
                    paymentMethod === "nowpayments"
                      ? "bg-black text-black border-4 border-black"
                      : "bg-white text-black"
                  }`}
                >
                  NowPayments (Crypto)
                </motion.button>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#ffffff" }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!paymentMethod || loading}
              className={`w-full py-3 rounded-lg font-bold transition duration-300 ${
                !paymentMethod || loading
                  ? "bg-neutral-600 cursor-not-allowed text-gray-400"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;
