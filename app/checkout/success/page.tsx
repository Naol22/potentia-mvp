'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, redirect } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Order {
  id: string;
  start_date: string;
  end_date: string;
  btc_address: string;
  auto_renew: boolean;
  stripe_payment_id: string;
  plan_id: {
    hashrate: number;
    price: number;
    type: string;
    facility_id: {
      name: string;
    };
    miner_id: {
      name: string;
    };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and anon key must be defined in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  async accessToken() {
    const { getToken } = (await import('@clerk/nextjs')).useAuth();
    return (await getToken()) ?? null;
  },
});

export default function CheckoutSuccessPage() {
  const { isSignedIn } = useUser(); 
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isSignedIn) {
    redirect('/sign-in');
  }

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    async function fetchOrder() {
      if (!sessionId) {
        setError('Session ID is missing');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*, plan_id (hashrate, price, type, facility_id (name), miner_id (name))')
        .eq('stripe_payment_id', sessionId)
        .single();

      if (error || !data) {
        setError('Order not found');
        setLoading(false);
        return;
      }

      setOrder(data as Order);
      setLoading(false);
    }

    fetchOrder();
  }, [sessionId]);

  if (loading) {
    return <div className="bg-black text-white min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="bg-black text-white min-h-screen flex items-center justify-center">{error}</div>;
  }

  if (!order) {
    return <div className="bg-black text-white min-h-screen flex items-center justify-center">Order not found</div>;
  }

  return (
    <div className="bg-black text-white py-12 px-4 font-['Inter']">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl font-bold mb-4">Purchase Successful!</h1>
        <p className="text-lg mb-8">Thank you for your purchase. Your mining plan is now active.</p>

        <div className="bg-neutral-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">
            {order.plan_id.type === 'hashrate' ? 'Hashrate' : 'Hosting'} Plan - {order.plan_id.hashrate} TH/s
          </h2>
          <div className="space-y-2 text-sm">
            <p>Facility: {order.plan_id.facility_id.name}</p>
            <p>Miner: {order.plan_id.miner_id.name}</p>
            <p>Start Date: {new Date(order.start_date).toLocaleDateString()}</p>
            <p>End Date: {new Date(order.end_date).toLocaleDateString()}</p>
            <p>BTC Address for Payouts: {order.btc_address}</p>
            <p>Auto-Renew: {order.auto_renew ? 'Enabled' : 'Disabled'}</p>
            <p className="text-lg font-bold mt-2">Total: ${order.plan_id.price.toFixed(2)}</p>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-8">
          <Link href="/dashboard">
            <Button className="bg-white text-black hover:bg-black hover:text-white rounded-full py-4 px-8 text-lg font-semibold transition-all">
              Go to Dashboard
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}