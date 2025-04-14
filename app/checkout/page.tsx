"use client";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
// import { STRIPE_PRODUCTS } from "@/config/stripe-products";
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const selectedPlan = searchParams.get("plan");
  const selectedHashRate = searchParams.get("hashRate");
  const paymentMethod = searchParams.get("paymentMethod") || "card";

  useEffect(() => {
    if (!isLoaded || !user) {
      window.location.href = "/sign-in?redirect_url=/products"; // Redirect if not signed in
    }
  }, [isLoaded, user]);

  const handleCheckout = async () => {
    if (!user || !selectedPlan || !selectedHashRate) return;
    setLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || '',
        //   planId: STRIPE_PRODUCTS.plans[selectedPlan],
        //   hashRateId: STRIPE_PRODUCTS.hashRates[selectedHashRate],
          paymentMethod,
        }),
      });
      const data = await response.json();
      if (!data.sessionId) throw new Error("Failed to create checkout session");
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !user) return <div>Loading...</div>;
  if (!selectedPlan || !selectedHashRate) return <div>Please select a product from <Link href="/products">Products</Link></div>;

  // Pricing logic (placeholder - replace with actual Stripe prices if dynamic)
  const planPrice = selectedPlan === "One Time" ? 39900 : 10900; // cents
  const hashRatePrice = {
    "200 TH": 20000,
    "300 TH": 30000,
    "400 TH": 40000,
    "500 TH": 50000,
  }[selectedHashRate] || 0;
  const total = planPrice + hashRatePrice;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Payment Info */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <p className="mt-1 text-gray-900">{paymentMethod === "card" ? "Credit/Debit Card" : paymentMethod === "apple_pay" ? "Apple Pay" : "Google Pay"}</p>
            </div>
            {paymentMethod === "card" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Card Number</label>
                  <p className="mt-1 text-gray-500 italic">Processed securely by Stripe</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiration</label>
                    <p className="mt-1 text-gray-500 italic">MM/YY</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CVC</label>
                    <p className="mt-1 text-gray-500 italic">3 digits</p>
                  </div>
                </div>
              </>
            )}
            <p className="text-sm text-gray-500">You&apos;ll be redirected to Stripe&apos;s secure checkout to complete your payment.</p>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Plan: {selectedPlan}</span>
              <span>${(planPrice / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Hash Rate: {selectedHashRate}</span>
              <span>${(hashRatePrice / 100).toFixed(2)}</span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${(total / 100).toFixed(2)}</span>
            </div>
            <Button
              className="w-full mt-6 bg-black text-white hover:bg-gray-800"
              disabled={loading}
              onClick={handleCheckout}
            >
              {loading ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}