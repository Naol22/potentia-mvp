'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, redirect } from 'next/navigation';
import { useUser, SignedIn, SignedOut } from '@clerk/nextjs';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GlobalLoadingScreen from '@/components/GlobalLoadingScreen';
import { InfoIcon, Zap, Clock, Snowflake, Network } from 'lucide-react';

interface Plan {
  id: string;
  type: string;
  hashrate: number;
  price: number;
  duration: string;
  facility_id: {
    name: string;
  };
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { user, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedHashrate, setSelectedHashrate] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [btcAddress, setBtcAddress] = useState('');
  const [autoRenew, setAutoRenew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSignedIn) {
    redirect('/sign-in');
  }

  const planId = searchParams.get('planId');
  const hashrate = searchParams.get('hashrate');
  const duration = searchParams.get('duration');

  useEffect(() => {
    async function fetchPlan() {
      console.log('Fetching plan with planId:', planId);
      if (!planId) {
        console.log('No planId provided in URL');
        setError('Plan ID is missing');
        setLoading(false);
        return;
      }

      // Validate and set hashrate and duration from query parameters
      if (hashrate) {
        setSelectedHashrate(Number(hashrate));
      } else {
        console.log('No hashrate provided in URL');
        setError('Hashrate is missing');
        setLoading(false);
        return;
      }

      if (duration) {
        setSelectedDuration(duration);
      } else {
        console.log('No duration provided in URL');
        setError('Duration is missing');
        setLoading(false);
        return;
      }

      try {
        const planResponse = await fetch(`/api/plans/${planId}`);
        console.log('Plan fetch response status:', planResponse.status);
        if (!planResponse.ok) {
          const errorText = await planResponse.text();
          console.error('Failed to fetch plan, response:', errorText);
          throw new Error('Failed to fetch plan');
        }
        const planData: Plan = await planResponse.json();
        console.log('Fetched plan data:', planData);
        setPlan(planData);
      } catch (err) {
        console.error('Error fetching plan:', err);
        setError('Plan not found');
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, [planId, hashrate, duration]);

  const handleCheckout = async () => {
    if (!btcAddress) {
      setError('Please enter a BTC address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Initiating checkout with planId:', planId, 'BTC Address:', btcAddress, 'Auto Renew:', autoRenew);
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, btcAddress, autoRenew }),
      });

      console.log('Checkout session response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create checkout session, response:', errorText);
        throw new Error('Failed to create checkout session');
      }

      const { sessionId }: { sessionId: string } = await response.json();
      console.log('Checkout session created, sessionId:', sessionId);
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) {
        console.error('Stripe redirect error:', stripeError.message);
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
    return <GlobalLoadingScreen />;
  }

  if (error) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center font-['Inter', 'Arial', sans-serif]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-6 bg-neutral-900 rounded-xl"
        >
          {error}
        </motion.div>
      </div>
    );
  }

  if (!plan || !selectedHashrate || !selectedDuration) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center font-['Inter', 'Arial', sans-serif]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-6 bg-neutral-900 rounded-xl"
        >
          Plan not found
        </motion.div>
      </div>
    );
  }

  const estimatedOutput = selectedHashrate * 0.0005;
  const hashRateFee = (0.00317 * selectedHashrate).toFixed(2);
  const electricityFee = (0.0059 * selectedHashrate).toFixed(2);

  return (
    <div
      className="bg-black pt-[200px] text-white py-16 px-4 sm:px-6 lg:px-8 min-h-screen font-['Inter', 'Arial', sans-serif] relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 50% 10%, rgba(255,255,255,0.05), transparent),
          linear-gradient(135deg, #000000, #1a1a1a 50%, #000000)`,
      }}
    >
      {/* Subtle animated background effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-full bg-gradient-to-r from-white/5 via-transparent to-white/5 animate-pulse-slow" />
      </div>

      {/* Checkout Progress Indicator */}
      <motion.div
        className="max-w-6xl mx-auto mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center items-center gap-4 text-sm text-gray-400">
          <span className="bg-neutral-800 px-3 py-1 rounded-full">1. Select Plan</span>
          <span className="text-white font-semibold">→</span>
          <span className="bg-white text-black px-3 py-1 rounded-full font-semibold">2. Checkout</span>
          <span className="text-white font-semibold">→</span>
          <span className="bg-neutral-800 px-3 py-1 rounded-full">3. Confirmation</span>
        </div>
      </motion.div>

      <motion.section
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Plan Details Card */}
        <motion.div
          className="bg-neutral-900 rounded-2xl overflow-hidden shadow-xl border border-neutral-700 relative"
          whileHover={{ scale: 1.02, boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Hashrate Plan - {selectedHashrate} TH/s
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              {plan.type === 'hashrate' ? 'Hashrate' : 'Hosting'} Plan
            </p>
            <div className="space-y-6">
              {/* Mining Setup Details */}
              <div className="bg-black p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Mining Setup Details</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <p className="flex items-center">
                    <Zap className="mr-3 text-white h-5 w-5" />
                    <span>
                      <span className="font-medium">Power Efficiency:</span> 17.5 J/TH - Industry-leading performance
                    </span>
                  </p>
                  <p className="flex items-center">
                    <Clock className="mr-3 text-white h-5 w-5" />
                    <span>
                      <span className="font-medium">Uptime Guarantee:</span> 99.9% with 24/7 monitoring
                    </span>
                  </p>
                  <p className="flex items-center">
                    <Snowflake className="mr-3 text-white h-5 w-5" />
                    <span>
                      <span className="font-medium">Cooling System:</span> Advanced air-cooling for reliability
                    </span>
                  </p>
                  <p className="flex items-center">
                    <Network className="mr-3 text-white h-5 w-5" />
                    <span>
                      <span className="font-medium">Network Stability:</span> Optimized for low-latency mining
                    </span>
                  </p>
                </div>
              </div>
              {/* Plan Details */}
              <div className="space-y-3 text-sm text-gray-300">
                <p className="flex items-center">
                  <span className="mr-3 text-white">📍</span> Facility: {plan.facility_id.name}
                </p>
                <p className="flex items-center">
                  <span className="mr-3 text-white">📊</span> Hash Rate Fee: ${hashRateFee}
                </p>
                <p className="flex items-center">
                  <span className="mr-3 text-white">⚡</span> Electricity Fee: ${electricityFee}
                </p>
                <p className="flex items-center">
                  <span className="mr-3 text-white">⏰</span> Static Output: {estimatedOutput.toFixed(4)} BTC/month
                </p>
                <p className="flex items-center">
                  <span className="mr-3 text-white">📅</span> Duration: {selectedDuration}
                </p>
                <p className="text-lg sm:text-xl font-bold mt-4 text-white">
                  Total: <span className="text-2xl">${plan.price.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Checkout Form Card */}
        <motion.div
          className="bg-neutral-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-neutral-700"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Complete Your Purchase
          </h2>
          <SignedIn>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Full Name</label>
                <p className="p-3 bg-black/50 border border-neutral-700 rounded-lg text-white">
                  {user?.fullName || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Email Address</label>
                <p className="p-3 bg-black/50 border border-neutral-700 rounded-lg text-white">
                  {user?.primaryEmailAddress?.emailAddress || 'N/A'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-gray-300" htmlFor="btcAddress">
                    BTC Address for Payouts
                  </label>
                  <div className="group relative">
                    <InfoIcon className="h-4 w-4 text-gray-400 cursor-pointer" />
                    <span className="absolute hidden group-hover:block -top-10 left-1/2 -translate-x-1/2 bg-neutral-800 text-xs text-white p-2 rounded-md shadow-lg w-48 text-center">
                      Enter a valid Bitcoin address where mining payouts will be sent.
                    </span>
                  </div>
                </div>
                <input
                  type="text"
                  id="btcAddress"
                  value={btcAddress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBtcAddress(e.target.value)}
                  className="w-full p-3 bg-black/50 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-white/20 transition-all"
                  placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                  required
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center text-sm font-medium text-gray-300">
                    <input
                      type="checkbox"
                      checked={autoRenew}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoRenew(e.target.checked)}
                      className="mr-2 bg-black text-white border-neutral-700 focus:ring-white/20"
                    />
                    Enable Auto-Renewal (Monthly)
                  </label>
                  <div className="group relative">
                    <InfoIcon className="h-4 w-4 text-gray-400 cursor-pointer" />
                    <span className="absolute hidden group-hover:block -top-10 left-1/2 -translate-x-1/2 bg-neutral-800 text-xs text-white p-2 rounded-md shadow-lg w-48 text-center">
                      Automatically renew your plan each month for uninterrupted mining.
                    </span>
                  </div>
                </div>
              </div>
              {error && (
                <motion.p
                  className="text-red-400 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.p>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleCheckout}
                  disabled={loading || !btcAddress}
                  className="w-full bg-gradient-to-r from-white to-gray-200 text-black hover:from-black hover:to-neutral-800 hover:text-white rounded-full py-4 text-lg font-semibold transition-all duration-300"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </Button>
              </motion.div>
            </div>
          </SignedIn>
          <SignedOut>
            <p className="text-gray-300 text-sm">Please sign in to complete your purchase.</p>
          </SignedOut>
        </motion.div>
      </motion.section>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}