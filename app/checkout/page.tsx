"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import GlobalLoadingScreen from "@/components/GlobalLoadingScreen";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { Zap } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { HashratePlan } from "@/types";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CheckoutPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<HashratePlan | null> (null);
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "nowpayments" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);

  const planId: string | undefined = searchParams.get("planId") ?? undefined;

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) {
        setError("No plan ID provided");
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`/api/hashrate-plans/${planId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch plans");
        }
        const data = await response.json();
        setPlan(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load plan details");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId]);

  const validateCryptoAddress = (address: string): boolean => {
    const btcRegex = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,59})$/;
    return btcRegex.test(address);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCryptoAddress(cryptoAddress)) {
      setError("Invalid cryptocurrency address");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    if (!isAddressConfirmed) {
      setError("Please confirm your Bitcoin address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      if (paymentMethod === "stripe") {
        response = await fetch("/api/checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            cryptoAddress,
            paymentMethod,
          }),
        });
      } else if (paymentMethod === "nowpayments") {
        response = await fetch("/api/nowpayments-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            cryptoAddress,
            paymentMethod,
          }),
        });
      }

      if (!response) {
        throw new Error("No response from payment processor");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initiate checkout");
      }

      const data = await response.json();

      if (paymentMethod === "stripe") {
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error("Stripe failed to load");
        }
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });
        if (stripeError) {
          throw new Error(stripeError.message);
        }
      } else if (paymentMethod === "nowpayments") {
        window.location.href = data.invoiceUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during checkout");
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

  const planType = "hashrate";
  const capitalizedPlanType = planType.charAt(0).toUpperCase() + planType.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white flex items-center justify-center p-6">
      {loading && <GlobalLoadingScreen />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-[150px] bg-neutral-800 rounded-xl shadow-lg p-8 max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Plan Overview Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Plan Overview</h1>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">{capitalizedPlanType} Plan</h2>
            <p className="text-lg">
              Hashrate: <span className="text-white">{plan.hashrate || "N/A"} TH/s</span>
            </p>
            <p className="text-lg">
              Price: <span className="text-white">${plan.price || "0.00"} {plan.currency || "USD"}</span>
            </p>
            <p className="text-lg">
              Duration: <span className="text-white">{plan.duration || "N/A"}</span>
            </p>
            <div className="bg-black p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white">Plan Specifications</h3>
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
                    <p className="text-gray-400">17.5 J/TH - Industry-leading performance</p>
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

        {/* Payment Details Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Payment Details</h1>
          <form onSubmit={handleCheckout} className="space-y-6">
            <div>
              <label htmlFor="cryptoAddress" className="block text-lg font-medium text-white">
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

            {/* Checkbox for Address Confirmation */}
            <div>
              <label className="flex items-center space-x-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={isAddressConfirmed}
                  onChange={(e) => setIsAddressConfirmed(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-white border-gray-600 focus:ring-2 focus:ring-white"
                />
                <span>I confirm this is my Bitcoin address</span>
              </label>
            </div>

            <div>
              <label className="block text-lg font-medium text-white mb-2">Select Payment Method</label>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 1.20 }}
                  type="button"
                  onClick={() => setPaymentMethod("stripe")}
                  className={`px-6 py-3 rounded-lg font-medium transition duration-300 ${
                    paymentMethod === "stripe" ? "bg-white text-black border-4 border-black" : "bg-white text-black"
                  }`}
                >
                  Stripe (Card)
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 1.20 }}
                  type="button"
                  onClick={() => setPaymentMethod("nowpayments")}
                  className={`px-6 py-3 rounded-lg font-medium transition duration-300 ${
                    paymentMethod === "nowpayments" ? "bg-white text-black border-4 border-black" : "bg-white text-black"
                  }`}
                >
                  NowPayments (Crypto)
                </motion.button>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!paymentMethod || !isAddressConfirmed || loading}
              className={`w-full py-3 rounded-lg font-bold transition duration-300 ${
                !paymentMethod || !isAddressConfirmed || loading
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