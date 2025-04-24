"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import GlobalLoadingScreen from "@/components/GlobalLoadingScreen";
import { Zap, Plug, Clock, Snowflake, Network } from "lucide-react";

interface Plan {
  id: string;
  type: string;
  hashrate: number;
  price: number;
  duration: string;
  facility_id: { name: string };
}

const HashrateTab = () => {
  const [plans, setPlans] = useState<Plan[]>([]); 
  const [selectedHashrate, setSelectedHashrate] = useState<number>(100); 
  const [selectedDuration, setSelectedDuration] = useState<string>(
    "Monthly (Recurring)"
  ); 
  const [animatedPrice, setAnimatedPrice] = useState<number>(150); 
  const [animatedOutput, setAnimatedOutput] = useState<number>(0.05); 
  const [loading, setLoading] = useState(true); 

  const durationOptions = ["Monthly (Recurring)"]; 

  useEffect(() => {
    async function fetchPlans() {
      console.log("Starting to fetch plans...");
      try {
        const response = await fetch("/api/plans");
        console.log("Fetch response status:", response.status);
        if (!response.ok) {
          throw new Error("Failed to fetch plans");
        }
        const data: Plan[] = await response.json();
        console.log("Fetched plans:", data);
        const hashratePlans = data.filter((plan) => plan.type === "hashrate");
        setPlans(hashratePlans);

        if (hashratePlans.length > 0) {
          setSelectedHashrate(hashratePlans[0].hashrate);
          setAnimatedPrice(hashratePlans[0].price);
          setAnimatedOutput(hashratePlans[0].hashrate * 0.0005);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        console.log("Fetch completed, setting loading to false");
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  const calculateMachinesLit = (hashrate: number): number => {
    const maxHashrate = 3000; 
    const maxMachines = 15; 
    return Math.min(
      Math.round((hashrate / maxHashrate) * maxMachines),
      maxMachines
    );
  };

  const selectedPlan = plans.find((plan) => plan.hashrate === selectedHashrate);

  const totalPrice = selectedPlan ? selectedPlan.price : 150;
  const machinesLit = selectedPlan
    ? calculateMachinesLit(selectedPlan.hashrate)
    : 1;
  const estimatedOutput = selectedHashrate * 0.0005;

  useEffect(() => {
    const priceTimeout = setTimeout(() => setAnimatedPrice(totalPrice), 100);
    const outputTimeout = setTimeout(
      () => setAnimatedOutput(estimatedOutput),
      100
    );
    return () => {
      clearTimeout(priceTimeout);
      clearTimeout(outputTimeout);
    };
  }, [totalPrice, estimatedOutput]);

  const selectedPlanId = selectedPlan ? selectedPlan.id : "";
  const queryParams = new URLSearchParams({
    planId: selectedPlanId,
    hashrate: selectedHashrate.toString(),
    duration: selectedDuration,
  }).toString();

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
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        No plans available
      </div>
    );
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
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.hashrate}>
                      {plan.hashrate} TH/s - ${plan.price}/month
                    </option>
                  ))}
                </motion.select>
              </div>

              {/* Duration Selection */}
              <div className="relative group">
                <label className="block text-sm font-medium mb-2">
                  Duration
                  <span className="ml-2 text-xs text-gray-400 cursor-help group-hover:underline">
                    Plan Duration
                  </span>
                  <div className="absolute hidden group-hover:block bg-black text-white text-xs p-2 rounded-lg -top-10 left-0 w-48 z-10">
                    Choose the duration of your mining plan. Monthly plans renew
                    automatically.
                  </div>
                </label>
                <motion.select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-white/20"
                  whileHover={{ scale: 1.02 }}
                >
                  {durationOptions.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
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
                    <Zap className="text-white h-5 w-5" />
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
                    <Plug className="text-white h-5 w-5" />
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
                    <Clock className="text-white h-5 w-5" />
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
                    <Snowflake className="text-white h-5 w-5" />
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
                    <Network className="text-white h-5 w-5" />
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
                      animate={i < machinesLit ? "unlocked" : "locked"}
                    >
                      <Image
                        src={
                          i < machinesLit
                            ? "/gpuunlocked.png"
                            : "/gpulocked.png"
                        }
                        alt={i < machinesLit ? "Active GPU" : "Inactive GPU"}
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Link href={`/checkout?${queryParams}`}>
                  <Button className="bg-white text-black hover:bg-black hover:text-white rounded-full px-10 py-4 text-lg font-semibold transition-all duration-300">
                    Proceed to Checkout
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
              99.9% uptime with advanced hardware.
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
        Frequently Asked Questions
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
