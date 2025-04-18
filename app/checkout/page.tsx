"use client";
import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSearchParams, redirect } from "next/navigation";
import { useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import { supabase } from "@/utils/supaBaseClient"; // Adjust based on your Supabase client setup
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Plan {
  id: string;
  type: string;
  hashrate: number;
  price: number;
  duration: string;
}

function CheckoutContent() {
  const { user, isSignedIn } = useUser();
  const searchParams = useSearchParams();

  if (!isSignedIn) {
    redirect("/sign-in");
  }

  const planId = searchParams.get("planId");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [btcAddress, setBtcAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (planId) {
      const fetchPlan = async () => {
        const { data, error } = await supabase
          .from("plans")
          .select("id, type, hashrate, price, duration")
          .eq("id", planId)
          .single();
        if (error) {
          console.error("Error fetching plan:", error);
        } else {
          setPlan(data);
        }
      };
      fetchPlan();
    }
  }, [planId]);

  const handleCheckout = async () => {
    if (!btcAddress) {
      alert("Please enter a BTC address.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          planId: plan?.id,
          btcAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error("Stripe redirect error:", error);
          alert("Payment redirect failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error initiating checkout:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return <div>Loading plan details...</div>;
  }

  const estimatedOutput = plan.hashrate * 0.0005;
  const hashRateFee = (0.00317 * plan.hashrate).toFixed(2);
  const electricityFee = (0.0059 * plan.hashrate).toFixed(2);

  return (
    <div className="bg-black text-white mt-[100px] py-12 px-4 overflow-x-hidden font-['Inter']">
      <motion.section
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Left: Order Summary */}
        <motion.div
          className="bg-neutral-800 rounded-xl overflow-hidden shadow-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <Image
              src="/antminer-s21.png"
              alt="Antminer S21"
              width={600}
              height={400}
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{plan.type} Plan - {plan.hashrate} TH/s</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="mr-2">📊</span> Hash Rate Fee: ${hashRateFee}
              </p>
              <p>
                <span className="mr-2">⚡</span> Electricity Fee: ${electricityFee}
              </p>
              <p>
                <span className="mr-2">⏰</span> Static Output: {estimatedOutput.toFixed(4)} BTC/month
              </p>
              <p>
                <span className="mr-2">📅</span> Duration: {plan.duration}
              </p>
              <p className="text-lg font-bold mt-2">Total: ${plan.price.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>

        {/* Right: Payment Section */}
        <motion.div
          className="bg-neutral-800 p-8 rounded-xl shadow-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Complete Your Purchase</h2>
          <SignedIn>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="btcAddress">
                  BTC Address for Payouts
                </label>
                <input
                  type="text"
                  id="btcAddress"
                  value={btcAddress}
                  onChange={(e) => setBtcAddress(e.target.value)}
                  className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-white/20"
                  placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                  required
                />
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleCheckout}
                  disabled={loading || !btcAddress}
                  className="w-full bg-white text-black hover:bg-black hover:text-white rounded-full py-4 text-lg font-semibold transition-all"
                >
                  {loading ? "Processing..." : "Proceed to Payment"}
                </Button>
              </motion.div>
            </div>
          </SignedIn>
          <SignedOut>
            <p className="text-gray-300">Please sign in to complete your purchase.</p>
          </SignedOut>
        </motion.div>
      </motion.section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}