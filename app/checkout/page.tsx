import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";

interface Plan {
  id: string;
  type: string;
  hashrate: number;
  price: number;
  currency: string;
  duration: string;
  miner_id: string | null;
  facility_id: string | null;
  stripe_price_id: string | null;
  nowpayments_item_code: string | null;
  is_subscription: boolean;
}

const CheckoutPage: React.FC = () => {
  const { planId } = useParams();
  const { getToken, userId } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "nowpayments">("stripe");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch plan details
  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) return;
      try {
        const response = await fetch(`/api/plans/${planId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch plan");
        }
        const data = await response.json();
        setPlan(data);
      } catch (err) {
        setError("Error fetching plan details");
        console.error(err);
      }
    };
    fetchPlan();
  }, [planId]);

  // Validate cryptocurrency address (basic BTC address regex)
  const validateCryptoAddress = (address: string): boolean => {
    // Basic regex for BTC addresses (supports legacy, SegWit, and Bech32)
    const btcRegex = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,59})$/;
    return btcRegex.test(address);
  };

  // Handle form submission
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

    setLoading(true);
    setError(null);

    try {
      // Get Clerk token
      const token = await getToken();
      if (!token) {
        throw new Error("Failed to retrieve authentication token");
      }

      // Update user's crypto address in Supabase
      const supabase = createClerkSupabaseClient(token);
      const { error: updateError } = await supabase
        .from("users")
        .update({ crypto_address: cryptoAddress })
        .eq("clerk_user_id", userId);

      if (updateError) {
        throw new Error(`Failed to update crypto address: ${updateError.message}`);
      }

      // Redirect to payment flow based on selection
      if (paymentMethod === "stripe") {
        // Redirect to Stripe checkout (handled by create-checkout-session)
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
        // NowPayments: Create payment
        const nowPaymentsResponse = await fetch("https://api.nowpayments.io/v1/invoice", {
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
        });

        const nowPaymentsData = await nowPaymentsResponse.json();
        if (nowPaymentsResponse.ok && nowPaymentsData.invoice_url) {
          // Store transaction in Supabase
          const { error: transactionError } = await supabase
            .from("transactions")
            .insert({
              user_id: userId,
              plan_id: planId,
              amount: plan?.price,
              currency: plan?.currency,
              status: "pending",
              type: "crypto_payment",
              nowpayments_payment_id: nowPaymentsData.payment_id,
              description: `Crypto payment for plan ${planId}`,
              created_at: new Date(),
            });

          if (transactionError) {
            throw new Error(`Failed to record transaction: ${transactionError.message}`);
          }

          window.location.href = nowPaymentsData.invoice_url;
        } else {
          throw new Error("Failed to initiate NowPayments checkout");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during checkout");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return <div className="text-center text-white">Loading plan details...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{plan.type} Plan</h2>
          <p>Hashrate: {plan.hashrate} TH/s</p>
          <p>Price: {plan.price} {plan.currency}</p>
          <p>Duration: {plan.duration}</p>
          {plan.miner_id && <p>Miner ID: {plan.miner_id}</p>}
          {plan.facility_id && <p>Facility ID: {plan.facility_id}</p>}
        </div>

        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label htmlFor="cryptoAddress" className="block text-sm font-medium">
              Cryptocurrency Payout Address (BTC)
            </label>
            <input
              id="cryptoAddress"
              type="text"
              value={cryptoAddress}
              onChange={(e) => setCryptoAddress(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your BTC address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("stripe")}
                className={`px-4 py-2 rounded-md ${paymentMethod === "stripe" ? "bg-blue-600" : "bg-gray-600"}`}
              >
                Stripe (Card)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("nowpayments")}
                className={`px-4 py-2 rounded-md ${paymentMethod === "nowpayments" ? "bg-blue-600" : "bg-gray-600"}`}
              >
                NowPayments (Crypto)
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;