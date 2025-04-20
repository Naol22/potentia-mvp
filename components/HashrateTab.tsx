'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import GlobalLoadingScreen from '@/components/GlobalLoadingScreen';

// Define the Plan interface to match the backend schema
interface Plan {
  id: string;
  type: string;
  hashrate: number;
  price: number;
  duration: string;
  facility_id: { name: string };
  miner_id: { name: string };
}

const HashrateTab = () => {
  const [plans, setPlans] = useState<Plan[]>([]); // Store fetched plans
  const [selectedHashrate, setSelectedHashrate] = useState<number>(100); // Default to 100 TH/s
  const [selectedModel, setSelectedModel] = useState<string>('Antminer S21'); // Default to Antminer S21
  const [animatedPrice, setAnimatedPrice] = useState<number>(150); // Default price
  const [animatedOutput, setAnimatedOutput] = useState<number>(0.05); // Default output
  const [loading, setLoading] = useState(true); // Loading state for fetching plans

  // Fetch plans from the backend on component mount
  useEffect(() => {
    async function fetchPlans() {
      console.log('Starting to fetch plans...');
      try {
        const response = await fetch('/api/plans');
        console.log('Fetch response status:', response.status);
        if (!response.ok) {
          throw new Error('Failed to fetch plans');
        }
        const data: Plan[] = await response.json();
        console.log('Fetched plans:', data);
        // Filter for hashrate plans
        const hashratePlans = data.filter((plan) => plan.type === 'hashrate');
        setPlans(hashratePlans);

        // Set initial selected hashrate and model based on fetched plans
        if (hashratePlans.length > 0) {
          setSelectedHashrate(hashratePlans[0].hashrate);
          setSelectedModel(hashratePlans[0].miner_id.name);
          setAnimatedPrice(hashratePlans[0].price);
          setAnimatedOutput(hashratePlans[0].hashrate * 0.0005);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        console.log('Fetch completed, setting loading to false');
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  // Calculate machinesLit based on hashrate (same logic as hardcoded data)
  const calculateMachinesLit = (hashrate: number): number => {
    const maxHashrate = 3000; // From hardcoded data
    const maxMachines = 15; // From hardcoded data
    return Math.min(Math.round((hashrate / maxHashrate) * maxMachines), maxMachines);
  };

  // Filter plans based on the selected miner model
  const filteredPlans = plans.filter((plan) => plan.miner_id.name === selectedModel);

  // Get unique miners from plans
  const uniqueMiners = Array.from(new Set(plans.map((plan) => plan.miner_id.name)));

  // Find the selected plan based on hashrate
  const selectedPlan = filteredPlans.find((plan) => plan.hashrate === selectedHashrate);

  // Fallback to defaults if no plan is found
  const totalPrice = selectedPlan ? selectedPlan.price : 150;
  const machinesLit = selectedPlan ? calculateMachinesLit(selectedPlan.hashrate) : 1;
  const estimatedOutput = selectedHashrate * 0.0005;

  // Animate price and output transitions
  useEffect(() => {
    const priceTimeout = setTimeout(() => setAnimatedPrice(totalPrice), 100);
    const outputTimeout = setTimeout(() => setAnimatedOutput(estimatedOutput), 100);
    return () => {
      clearTimeout(priceTimeout);
      clearTimeout(outputTimeout);
    };
  }, [totalPrice, estimatedOutput]);

  // Prepare the query parameter for the details page (only pass planId)
  const selectedPlanId = selectedPlan ? selectedPlan.id : '';
  const queryParams = new URLSearchParams({
    planId: selectedPlanId,
  }).toString();

  // Animation variants (unchanged)
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const gpuVariants = {
    locked: { scale: 0.8, opacity: 0.5 },
    unlocked: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
  };

  const infoItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, delay: i * 0.1 },
    }),
  };

  if (loading) {
    return <GlobalLoadingScreen />;
  }

  if (plans.length === 0) {
    return <div className="bg-black text-white min-h-screen flex items-center justify-center">No plans available</div>;
  }

  return (
    <div className="bg-black text-white py-12 px-4 overflow-x-hidden font-['Inter']">
      {/* Main Content */}
      <motion.div
        className="max-w-5xl mx-auto mt-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Selection Panel */}
          <motion.div
            className="md:col-span-2 bg-neutral-800 p-8 rounded-xl shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
            <div className="space-y-6">
              {/* Hashrate Selection */}
              <div className="relative group">
                <label className="block text-sm font-medium mb-2">
                  Hashrate (TH/s)
                  <span className="ml-2 text-xs text-gray-400 cursor-help group-hover:underline">
                    What is TH/s?
                  </span>
                  <div className="absolute hidden group-hover:block bg-black text-white text-xs p-2 rounded-lg -top-10 left-0 w-48 z-10">
                    Terahashes per second (TH/s) measures mining power. Higher
                    TH/s means more Bitcoin earned.
                  </div>
                </label>
                <motion.select
                  value={selectedHashrate}
                  onChange={(e) => setSelectedHashrate(Number(e.target.value))}
                  className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-white/20"
                  whileHover={{ scale: 1.02 }}
                >
                  {filteredPlans.map((plan) => (
                    <option key={plan.id} value={plan.hashrate}>
                      {plan.hashrate} TH/s - ${plan.price}/month
                    </option>
                  ))}
                </motion.select>
              </div>

              {/* Miner Model Selection */}
              <div className="relative group">
                <label className="block text-sm font-medium mb-2">
                  Miner Model
                  <span className="ml-2 text-xs text-gray-400 cursor-help group-hover:underline">
                    About Antminer S21
                  </span>
                  <div className="absolute hidden group-hover:block bg-black text-white text-xs p-2 rounded-lg -top-10 left-0 w-48 z-10">
                    The Antminer S21 offers 200 TH/s with 17.5 J/TH efficiency,
                    ideal for high-performance mining.
                  </div>
                </label>
                <motion.select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-white/20"
                  whileHover={{ scale: 1.02 }}
                >
                  {uniqueMiners.map((minerName) => (
                    <option key={minerName} value={minerName}>
                      {minerName}
                    </option>
                  ))}
                </motion.select>
              </div>

              {/* Enhanced Plan Details */}
              <div className="bg-black p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">
                  Plan Specifications
                </h3>
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <motion.div
                    className="flex items-center space-x-3"
                    variants={infoItemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={0}
                  >
                    <span className="text-lg">⚡</span>
                    <div>
                      <p className="font-medium">Power Efficiency</p>
                      <p className="text-gray-300">
                        17.5 J/TH - Industry-leading performance
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-3"
                    variants={infoItemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={1}
                  >
                    <span className="text-lg">🔌</span>
                    <div>
                      <p className="font-medium">Power Consumption</p>
                      <p className="text-gray-300">
                        ~3500W per unit, optimized for cost
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-3"
                    variants={infoItemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={2}
                  >
                    <span className="text-lg">⏰</span>
                    <div>
                      <p className="font-medium">Uptime Guarantee</p>
                      <p className="text-gray-300">
                        99.9% with 24/7 monitoring
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-3"
                    variants={infoItemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={3}
                  >
                    <span className="text-lg">❄️</span>
                    <div>
                      <p className="font-medium">Cooling System</p>
                      <p className="text-gray-300">
                        Advanced air-cooling for reliability
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-3"
                    variants={infoItemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={4}
                  >
                    <span className="text-lg">🌐</span>
                    <div>
                      <p className="font-medium">Network Stability</p>
                      <p className="text-gray-300">
                        Optimized for low-latency mining
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Summary Panel */}
          <motion.div
            className="bg-gradient-to-b from-neutral-900 to-black p-8 rounded-xl shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-xl font-bold mb-4 text-center">
              Your Mining Setup
            </h3>
            <div className="space-y-6">
              {/* Dynamic Stats */}
              <div className="text-center">
                <p className="text-sm text-gray-400">Hashrate</p>
                <motion.p
                  className="text-2xl font-bold"
                  key={selectedHashrate}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {selectedHashrate} TH/s
                </motion.p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Monthly Price</p>
                <motion.p
                  className="text-2xl font-bold"
                  key={animatedPrice}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ${animatedPrice.toFixed(0)}
                </motion.p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Est. Output</p>
                <motion.p
                  className="text-2xl font-bold"
                  key={animatedOutput}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {animatedOutput.toFixed(4)} BTC
                </motion.p>
              </div>

              {/* GPU Visualization */}
              <div>
                <p className="text-sm font-medium text-center mb-4">
                  Active Machines ({machinesLit}/15)
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                      key={i}
                      variants={gpuVariants}
                      initial="locked"
                      animate={i < machinesLit ? 'unlocked' : 'locked'}
                    >
                      <Image
                        src={
                          i < machinesLit
                            ? '/gpuunlocked.png'
                            : '/gpulocked.png'
                        }
                        alt={i < machinesLit ? 'Active GPU' : 'Inactive GPU'}
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Radial Progress */}
              <div className="flex justify-center">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-700"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <motion.circle
                      className="text-white"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - machinesLit / 15)}
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{
                        strokeDashoffset: 251.2 * (1 - machinesLit / 15),
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                  <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-bold">
                    {Math.round((machinesLit / 15) * 100)}%
                  </p>
                </div>
              </div>

              {/* Check Details Button */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Link href={`/details?${queryParams}`}>
                  <Button className="bg-white text-black hover:bg-black hover:text-white rounded-full px-10 py-4 text-lg font-semibold transition-all duration-300">
                    Check Details
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Info Section */}
      <motion.section
        className="max-w-5xl mx-auto mt-16 bg-neutral-800 p-8 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">
          Why Mine with Potentia?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="bg-black p-6 rounded-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-2">Sustainable Power</h3>
            <p className="text-sm text-gray-300">
              Powered by hydro and solar energy at 4.0¢/kWh.
            </p>
          </motion.div>
          <motion.div
            className="bg-black p-6 rounded-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-2">High Uptime</h3>
            <p className="text-sm text-gray-300">
              99.9% uptime with advanced Antminer S21 hardware.
            </p>
          </motion.div>
          <motion.div
            className="bg-black p-6 rounded-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-2">Global Facilities</h3>
            <p className="text-sm text-gray-300">
              Data centers in Ethiopia, Dubai, and Texas.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="max-w-5xl mx-auto mt-16 bg-neutral-800 p-8 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              How does cloud mining work?
            </h3>
            <p className="text-sm text-gray-300">
              You rent hashrate from our data centers, and we handle the
              hardware, maintenance, and power. You earn Bitcoin daily.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              What is the Antminer S21?
            </h3>
            <p className="text-sm text-gray-300">
              The Antminer S21 is a top-tier Bitcoin miner with 200 TH/s per
              unit and 17.5 J/TH efficiency.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Can I change my hashrate later?
            </h3>
            <p className="text-sm text-gray-300">
              Yes, our monthly plans allow you to scale up or down anytime.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HashrateTab;