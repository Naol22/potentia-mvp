'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, redirect } from 'next/navigation';
import { useUser, SignedIn, SignedOut } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Plan {
  id: string;
  type: string;
  hashrate: number;
  price: number;
  duration: string;
  facility_id: {
    name: string;
  };
  miner_id: {
    name: string;
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    async accessToken() {
      const { getToken } = (await import('@clerk/nextjs')).useAuth();
      return (await getToken()) ?? null;
    },
  }
);

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { user, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [btcAddress, setBtcAddress] = useState('');
  const [autoRenew, setAutoRenew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSignedIn) {
    redirect('/sign-in');
  }

  const planId = searchParams.get('planId');

  useEffect(() => {
    async function fetchPlan() {
      if (!planId) {
        setError('Plan ID is missing');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('plans')
        .select('*, facility_id (name), miner_id (name)')
        .eq('id', planId)
        .single();

      if (error || !data) {
        setError('Plan not found');
        setLoading(false);
        return;
      }

      setPlan(data as Plan);
      setLoading(false);
    }

    fetchPlan();
  }, [planId]);

  const handleCheckout = async () => {
    if (!btcAddress) {
      setError('Please enter a BTC address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, btcAddress, autoRenew }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId }: { sessionId: string } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error initiating checkout:', errorMessage);
      setError('Failed to initiate checkout. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="bg-black text-white min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="bg-black text-white min-h-screen flex items-center justify-center">{error}</div>;
  }

  if (!plan) {
    return <div className="bg-black text-white min-h-screen flex items-center justify-center">Plan not found</div>;
  }

  const estimatedOutput = plan.hashrate * 0.0005;
  const hashRateFee = (0.00317 * plan.hashrate).toFixed(2);
  const electricityFee = (0.0059 * plan.hashrate).toFixed(2);

  return (
    <div className="bg-black text-white py-12 px-4 overflow-x-hidden font-['Inter']">
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
            <div className="absolute inset-0 border-4 border-transparent rounded-xl bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-pulse" />
            <Image
              src="/antminer-s21.png"
              alt="Antminer S21"
              width={600}
              height={400}
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">
              {plan.miner_id.name} - {plan.hashrate} TH/s ({plan.type === 'hashrate' ? 'Hashrate' : 'Hosting'} Plan)
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="mr-2">📍</span> Facility: {plan.facility_id.name}
              </p>
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
              <p className="text-lg font-bold mt-2">
                Total: ${plan.price.toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right: Checkout Form */}
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
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <p className="p-3 bg-black border border-neutral-700 rounded-lg text-white">
                  {user?.fullName || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <p className="p-3 bg-black border border-neutral-700 rounded-lg text-white">
                  {user?.primaryEmailAddress?.emailAddress || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="btcAddress">
                  BTC Address for Payouts
                </label>
                <input
                  type="text"
                  id="btcAddress"
                  value={btcAddress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBtcAddress(e.target.value)}
                  className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-white/20"
                  placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                  required
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium mb-2">
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoRenew(e.target.checked)}
                    className="mr-2"
                  />
                  Enable Auto-Renewal (Monthly)
                </label>
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleCheckout}
                  disabled={loading || !btcAddress}
                  className="w-full bg-white text-black hover:bg-black hover:text-white rounded-full py-4 text-lg font-semibold transition-all"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
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