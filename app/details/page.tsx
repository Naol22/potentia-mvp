'use client';
import React, { useState, useEffect, ChangeEvent, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GlobalLoadingScreen from '@/components/GlobalLoadingScreen';

interface Plan {
  id: string;
  type: string;
  hashrate: number;
  price: number;
  duration: string;
  facility_id: { name: string };
  miner_id: { name: string };
}

const currencies = ['BTC'] as const;
const durations = ['Monthly Recurring'] as const;

function DetailsContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null); 
  const [allPlans, setAllPlans] = useState<Plan[]>([]); 
  const [selectedHashrate, setSelectedHashrate] = useState<number>(100); 
  const [animatedPrice, setAnimatedPrice] = useState<number>(5); 
  const [animatedOutput, setAnimatedOutput] = useState<number>(0); 
  const [animatedTotalSold, setAnimatedTotalSold] = useState<number>(0); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    async function fetchData() {
      if (!planId) {
        setError('Plan ID is missing');
        setLoading(false);
        return;
      }

      try {
        const planResponse = await fetch(`/api/plans/${planId}`);
        if (!planResponse.ok) {
          throw new Error('Failed to fetch plan');
        }
        const planData: Plan = await planResponse.json();
        setSelectedPlan(planData);

        const allPlansResponse = await fetch('/api/plans');
        if (!allPlansResponse.ok) {
          throw new Error('Failed to fetch all plans');
        }
        const allPlansData: Plan[] = await allPlansResponse.json();
        setAllPlans(allPlansData);

        setSelectedHashrate(planData.hashrate);
        setAnimatedPrice(planData.price);
        setAnimatedOutput(planData.hashrate * 0.0005);
      } catch (err) {
        setError('Failed to load plan details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [planId]);

  const filteredPlans = allPlans.filter(
    (plan) =>
      plan.type === 'hashrate' &&
      selectedPlan &&
      plan.miner_id.name === selectedPlan.miner_id.name
  );

  const currentPlan = filteredPlans.find((plan) => plan.hashrate === selectedHashrate) || selectedPlan;

  const calculateMachinesLit = (hashrate: number): number => {
    const maxHashrate = 3000; 
    const maxMachines = 15; 
    return Math.min(Math.round((hashrate / maxHashrate) * maxMachines), maxMachines);
  };

  const totalPrice: number = currentPlan ? currentPlan.price : 5;
  const machinesLit: number = currentPlan ? calculateMachinesLit(currentPlan.hashrate) : 1;
  const estimatedOutput: number = selectedHashrate * 0.0005;
  const hashRateFee: string = (0.00317 * selectedHashrate).toFixed(2);
  const electricityFee: string = (0.0059 * selectedHashrate).toFixed(2);
  const totalSold: number = Math.min((machinesLit / 15) * 100, 100);

  useEffect(() => {
    const priceTimeout = setTimeout(() => setAnimatedPrice(totalPrice), 100);
    const outputTimeout = setTimeout(() => setAnimatedOutput(estimatedOutput), 100);
    const totalSoldTimeout = setTimeout(() => setAnimatedTotalSold(totalSold), 100);

    return () => {
      clearTimeout(priceTimeout);
      clearTimeout(outputTimeout);
      clearTimeout(totalSoldTimeout);
    };
  }, [totalPrice, estimatedOutput, totalSold]);

  const queryParams = new URLSearchParams({
    planId: currentPlan ? currentPlan.id : '',
  }).toString();

  const statVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: i * 0.1 },
    }),
  };

  const handleHashrateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedHashrate(Number(e.target.value));
  };

  if (loading) {
    return <GlobalLoadingScreen />;
  }

  if (error || !selectedPlan) {
    return <div className="bg-black text-white min-h-screen flex items-center justify-center">{error || 'Plan not found'}</div>;
  }

  return (
    <div className="bg-black text-white py-12 mt-[100px] px-4 overflow-x-hidden font-['Inter']">
      {/* Main Section */}
      <motion.section
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Left: Miner Image and Stats */}
        <motion.div
          className="bg-neutral-800 rounded-xl overflow-hidden shadow-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <div className="absolute inset-0 border-4 border-transparent bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-pulse" />
            <Image
              src="/antminer-s21.png"
              alt="Antminer S21"
              width={900}
              height={700}
              className="w-full h-[200px] md:h-[450px] object-fill"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Antminer S21</h2>
            <div className="space-y-2 text-sm">
              <motion.p variants={statVariants} initial="hidden" animate="visible" custom={0}>
                <span className="mr-2">📊</span> Hash Rate Fee: ${hashRateFee}
              </motion.p>
              <motion.p variants={statVariants} initial="hidden" animate="visible" custom={1}>
                <span className="mr-2">⚡</span> Electricity Fee: ${electricityFee}
              </motion.p>
              {/* <motion.p variants={statVariants} initial="hidden" animate="visible" custom={2}>
                <span className="mr-2">⏰</span> Static Output: {animatedOutput.toFixed(4)} BTC/month
              </motion.p> */}
            </div>
            {/* Total Sold Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between mb-2 text-sm">
                <span>Total Sold</span>
                <span>{animatedTotalSold.toFixed(0)}%</span>
              </div>
              <div className="bg-neutral-700 h-3 rounded-full overflow-hidden">
                <motion.div
                  className="bg-white h-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${animatedTotalSold}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Mining starts in 24 hours. After-sales service by Potentia.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right: Plan Details */}
        <motion.div
          className="bg-neutral-800 p-8 rounded-xl shadow-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Hashrate Plan: {selectedHashrate} TH/s</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-white/20"
                defaultValue="BTC"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hashrate</label>
              <motion.select
                value={selectedHashrate}
                onChange={handleHashrateChange}
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-white/20"
                whileHover={{ scale: 1.02 }}
              >
                {filteredPlans.map((plan) => (
                  <option key={plan.id} value={plan.hashrate}>
                    {plan.hashrate} TH/s
                  </option>
                ))}
              </motion.select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <select
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-white/20"
                defaultValue="Monthly Recurring"
              >
                {durations.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Hash Rate Fee</span>
                <motion.span
                  key={hashRateFee}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  ${hashRateFee}
                </motion.span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Electricity Fee</span>
                <motion.span
                  key={electricityFee}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  ${electricityFee}
                </motion.span>
              </div>
              <div className="flex justify-between py-5 text-lg font-bold mt-4">
                <span>Total</span>
                <motion.span
                  key={animatedPrice}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  ${animatedPrice.toFixed(2)}
                </motion.span>
              </div>
            </div>
            <Link href={`/checkout?${queryParams}`}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="w-full bg-white text-black hover:bg-black hover:text-white rounded-full py-4 text-lg font-semibold transition-all">
                  Proceed to Checkout
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </motion.section>

      {/* Miner Specifications */}
      <motion.section
        className="max-w-6xl mx-auto mt-16 bg-neutral-800 p-8 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Antminer S21 Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Performance</h3>
            <p className="text-sm text-gray-300">
              Hashrate: Up to 200 TH/s per unit<br />
              Efficiency: 17.5 J/TH
            </p>
          </div>
          <div className="bg-black p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Power</h3>
            <p className="text-sm text-gray-300">
              Consumption: ~3500W<br />
              Voltage: 220-240V
            </p>
          </div>
          <div className="bg-black p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Design</h3>
            <p className="text-sm text-gray-300">
              Cooling: Advanced air-cooling<br />
              Dimensions: 400 x 195 x 290 mm
            </p>
          </div>
        </div>
      </motion.section>

      {/* Performance Metrics */}
      <motion.section
        className="max-w-6xl mx-auto mt-16 bg-neutral-800 p-8 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="bg-black p-6 rounded-lg text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-gray-400">Estimated Output</p>
            <motion.p
              key={animatedOutput}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-xl font-bold"
            >
              {animatedOutput.toFixed(4)} BTC/month
            </motion.p>
          </motion.div>
          <motion.div
            className="bg-black p-6 rounded-lg text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-gray-400">ROI (Est.)</p>
            <motion.p
              key={animatedPrice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-xl font-bold"
            >
              {((animatedOutput * 30000) / animatedPrice).toFixed(1)}%
            </motion.p>
          </motion.div>
          <motion.div
            className="bg-black p-6 rounded-lg text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-gray-400">Uptime</p>
            <p className="text-xl font-bold">99.9%</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Why Choose Potentia */}
      <motion.section
        className="max-w-6xl mx-auto mt-16 bg-neutral-800 p-8 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Why Choose Potentia?</h2>
        <ul className="list-disc list-inside space-y-3 text-sm text-gray-300">
          <li>Scalable hashrate from 100 TH/s to 3000 TH/s to suit your needs.</li>
          <li>Powered by Antminer S21, one of the most efficient miners available.</li>
          <li>Hosted in top-tier facilities with renewable energy sources.</li>
          <li>Transparent pricing at ${animatedPrice}/month for {selectedHashrate} TH/s.</li>
          <li>Estimated monthly output of ~{animatedOutput.toFixed(4)} BTC.</li>
          <li>24/7 support and real-time performance tracking.</li>
          <li>Global data centers in Ethiopia, Dubai, and Texas.</li>
        </ul>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="max-w-6xl mx-auto mt-16 bg-neutral-800 p-8 rounded-xl shadow-lg mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">What is cloud mining?</h3>
            <p className="text-sm text-gray-300">
              Cloud mining allows you to rent hashrate from remote data centers, eliminating the need to own or maintain hardware.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">How are payouts calculated?</h3>
            <p className="text-sm text-gray-300">
              Payouts are based on your hashrate and current network difficulty, paid daily in Bitcoin.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Can I upgrade my plan?</h3>
            <p className="text-sm text-gray-300">
              Yes, you can adjust your hashrate at any time to scale your mining output.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default function DetailsPage() {
  return (
    <Suspense fallback={<GlobalLoadingScreen />}>
      <DetailsContent />
    </Suspense>
  );
}