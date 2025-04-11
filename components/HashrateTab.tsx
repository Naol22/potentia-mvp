"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Simple Icons (replace with SVGs or a library like react-icons if preferred)
const LightningIcon = () => <span className="mr-2">⚡</span>;
const ClockIcon = () => <span className="mr-2">⏰</span>;
const ChartIcon = () => <span className="mr-2">📊</span>;
const EfficiencyIcon = () => <span className="mr-2">⚙️</span>;
const CoolingIcon = () => <span className="mr-2">❄️</span>;
const NetworkIcon = () => <span className="mr-2">🌐</span>;
const DowntimeIcon = () => <span className="mr-2">⚠️</span>;
const SupportIcon = () => <span className="mr-2">🛠️</span>;
const MinerIcon = () => <span className="mr-2">⛏️</span>;

const HashrateTab = () => {
  // State management
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [planMode, setPlanMode] = useState("Standard");
  const [minerModel, setMinerModel] = useState("Antminer S19Pro");
  const [planDurationFilter, setPlanDurationFilter] = useState("All");
  const [plans, setPlans] = useState([
    { name: "Starter", duration: 30, hashRate: 50, sold: 100, minerModel: "Antminer S19Pro" },
    { name: "Advanced", duration: 90, hashRate: 50, sold: 80, minerModel: "Antminer S19Pro" },
    { name: "Pro", duration: 180, hashRate: 50, sold: 60, minerModel: "Antminer S19Pro" },
    { name: "Custom", duration: 30, hashRate: 50, sold: 40, minerModel: "Antminer S19Pro" },
  ]);
  const [customDuration, setCustomDuration] = useState(30);

  // Filter options
  const planModes = ["Standard", "Eco", "Performance"];
  const minerModels = ["Antminer S19Pro", "Whatsminer M30S", "AvalonMiner 1246"];
  const planDurations = ["All", "Short (30-90 days)", "Medium (90-180 days)", "Long (180+ days)"];
  const hashRates = [50, 100, 150, 200];
  const cryptocurrencies = [
    { name: "BTC", icon: "₿" },
    { name: "ETH", icon: "Ξ" },
    { name: "DOGE", icon: "Ð" },
    { name: "LTC", icon: "Ł" },
  ];

  // Update hash rate, custom duration, and miner model
  const updateHashRate = (planName: string, newHashRate: number) =>
    setPlans(plans.map((p) => (p.name === planName ? { ...p, hashRate: newHashRate } : p)));
  const updateCustomDuration = (newDuration: number) => {
    setCustomDuration(newDuration);
    setPlans(plans.map((p) => (p.name === "Custom" ? { ...p, duration: newDuration } : p)));
  };
  const updateMinerModel = (newMinerModel: string) => {
    setMinerModel(newMinerModel);
    setPlans(plans.map((p) => ({ ...p, minerModel: newMinerModel })));
  };

  // Fee calculations
  const getFeeMultiplier = () => (planMode === "Eco" ? 0.9 : planMode === "Performance" ? 1.1 : 1);
  const getModelFeeAdjustment = () =>
    minerModel === "Antminer S19Pro" ? 0 : minerModel === "Whatsminer M30S" ? 0.001 : 0.002;
  const baseHashRateFee = 0.00317; // $/T/D
  const baseElectricityFee = 0.0059; // $/T/D
  const hashRateFee = (baseHashRateFee + getModelFeeAdjustment()) * getFeeMultiplier();
  const electricityFee = baseElectricityFee * getFeeMultiplier();

  // Calculations
  const calculateTotal = (hashRate: number, duration: number) =>
    ((hashRateFee + electricityFee) * hashRate * duration).toFixed(2);
  const calculateDailyOutput = (hashRate: number) => (hashRate * 0.00001).toFixed(5);
  const calculateROI = (hashRate: number, duration: number) => {
    const totalCost = parseFloat(calculateTotal(hashRate, duration));
    const totalOutput = parseFloat(calculateDailyOutput(hashRate)) * duration * 30000; // 1 BTC = $30,000
    return ((totalOutput / totalCost) * 100).toFixed(1);
  };

  // Filter plans
  const filteredPlans = plans.filter((plan) => {
    if (planDurationFilter === "All") return true;
    if (planDurationFilter === "Short (30-90 days)") return plan.duration <= 90;
    if (planDurationFilter === "Medium (90-180 days)") return plan.duration > 90 && plan.duration <= 180;
    return plan.duration > 180;
  });

  return (
    <div className="bg-black text-white min-h-screen p-8">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <div>
          <label className="block text-sm mb-2">Plan Mode</label>
          <motion.select
            value={planMode}
            onChange={(e) => setPlanMode(e.target.value)}
            className="bg-neutral-800 p-3 rounded-lg w-48"
            whileHover={{ scale: 1.05 }}
          >
            {planModes.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </motion.select>
        </div>
        <div>
          <label className="block text-sm mb-2">Miner Model</label>
          <motion.select
            value={minerModel}
            onChange={(e) => updateMinerModel(e.target.value)}
            className="bg-neutral-800 p-3 rounded-lg w-48"
            whileHover={{ scale: 1.05 }}
          >
            {minerModels.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </motion.select>
        </div>
        <div>
          <label className="block text-sm mb-2">Plan Duration</label>
          <motion.select
            value={planDurationFilter}
            onChange={(e) => setPlanDurationFilter(e.target.value)}
            className="bg-neutral-800 p-3 rounded-lg w-48"
            whileHover={{ scale: 1.05 }}
          >
            {planDurations.map((duration) => (
              <option key={duration} value={duration}>{duration}</option>
            ))}
          </motion.select>
        </div>
      </div>

      {/* Cryptocurrency Selector */}
      <div className="flex justify-center space-x-4 mb-8">
        {cryptocurrencies.map((crypto) => (
          <motion.button
            key={crypto.name}
            className={`px-6 py-3 rounded-lg text-lg font-medium flex items-center space-x-2 ${
              selectedCrypto === crypto.name ? "bg-white text-black" : "bg-neutral-800 text-white"
            }`}
            onClick={() => setSelectedCrypto(crypto.name)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{crypto.icon}</span>
            <span>{crypto.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Plan Cards (2x2 Grid, Reduced Height) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPlans.map((plan, index) => {
          // Calculate values to pass to the Details page
          const total = calculateTotal(plan.hashRate, plan.duration);
          const queryParams = new URLSearchParams({
            plan: plan.name,
            crypto: selectedCrypto,
            hashRate: plan.hashRate.toString(),
            duration: plan.duration.toString(),
            total: total,
            minerModel: plan.minerModel,
            hashRateFee: hashRateFee.toFixed(5),
            electricityFee: electricityFee.toFixed(5),
          }).toString();

          return (
            <motion.div
              key={plan.name}
              className="relative bg-neutral-800 p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Badges */}
              {plan.name === "Pro" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-sm">
                  Best Value
                </div>
              )}
              {plan.name === "Advanced" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-sm">
                  Recommended
                </div>
              )}

              <h3 className="text-2xl font-bold mb-4">{plan.name} - {plan.duration} Days</h3>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">Hash Rate (TH/s)</label>
                <select
                  value={plan.hashRate}
                  onChange={(e) => updateHashRate(plan.name, Number(e.target.value))}
                  className="w-full p-2 bg-black rounded border border-neutral-800 text-sm"
                >
                  {hashRates.map((rate) => (
                    <option key={rate} value={rate}>{rate} TH/s</option>
                  ))}
                </select>
              </div>
              <div className="mb-4 text-sm space-y-2">
                <p><ChartIcon /> Est. Daily Output: {calculateDailyOutput(plan.hashRate)} BTC</p>
                <p><ChartIcon /> Est. ROI: {calculateROI(plan.hashRate, plan.duration)}%</p>
                <p><LightningIcon /> Power: 3250W</p>
                <p><ClockIcon /> Uptime: 99.9%</p>
                <p><EfficiencyIcon /> Efficiency: 29 J/TH</p>
                <p><CoolingIcon /> Cooling: Air-cooled</p>
                <p><NetworkIcon /> Network Difficulty: 5.5T</p>
                <p><DowntimeIcon /> Expected Downtime: 0.1%</p>
                <p><SupportIcon /> Support Level: {plan.name === "Pro" || plan.name === "Custom" ? "Priority" : "Standard"}</p>
                <p><MinerIcon /> Miner: {plan.minerModel}</p>
                <p>Hash Rate Fee: ${hashRateFee.toFixed(5)}/T/D</p>
                <p>Electricity Fee: ${electricityFee.toFixed(5)}/T/D</p>
                <p className="text-2xl font-bold mt-2">Total: ${total}</p>
              </div>
              {plan.name === "Custom" && (
                <div className="mb-4">
                  <label className="block mb-1 text-sm font-medium">Duration (Days)</label>
                  <input
                    type="number"
                    value={customDuration}
                    onChange={(e) => updateCustomDuration(Number(e.target.value))}
                    className="w-full p-2 bg-black rounded border border-neutral-800 text-sm"
                  />
                </div>
              )}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-xs">Total Sold:</span>
                  <span className="text-xs">{plan.sold}%</span>
                </div>
                <div className="bg-black h-2 w-full rounded-full">
                  <motion.div
                    className="bg-white h-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${plan.sold}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-base font-semibold mb-1">Plan Features</h4>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>24/7 Monitoring</li>
                  <li>Daily Payouts</li>
                  <li>Real-Time Analytics</li>
                  {plan.name === "Pro" || plan.name === "Custom" ? <li>Dedicated Account Manager</li> : null}
                </ul>
              </div>
              <div className="flex space-x-4">
                <Link href={`/details?${queryParams}`}>
                  <Button className="w-full bg-white text-black hover:bg-black hover:text-white rounded-full py-2 text-base">
                    Check Details
                  </Button>
                </Link>
                {plan.name === "Starter" && (
                  <Button className="w-full bg-neutral-800 text-white hover:bg-white hover:text-black rounded-full py-2 text-base">
                    Quick Start
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Section */}
      <section className="mt-16 bg-neutral-800 p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Discover Cloud Mining with Potentia</h2>
        <p className="text-lg mb-6">
          Cloud mining made simple. Mine Bitcoin, Ethereum, and more without hardware or expertise. Potentia offers flexible plans and top-tier facilities worldwide.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
            <p className="text-sm">Facilities in Ethiopia, Dubai, and Texas with over 100 MW capacity.</p>
          </div>
          <div className="bg-black p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Sustainable Mining</h3>
            <p className="text-sm">Powered by hydro and solar energy, starting at 4.0ct/kWh.</p>
          </div>
          <div className="bg-black p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Reliable Performance</h3>
            <p className="text-sm">99.9% uptime with advanced hardware like Antminer S19Pro.</p>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">Why Choose Potentia?</h3>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>Lowest fees starting at $0.00317/T/D</li>
            <li>Eco-friendly mining with renewable energy</li>
            <li>High uptime guarantee of 99.9%</li>
            <li>Advanced hardware for maximum efficiency</li>
            <li>Plans for beginners and experts alike</li>
          </ul>
        </div>
      </section>

      {/* Contact Us Component */}
      <motion.section
        className="mt-16 bg-neutral-800 p-8 rounded-lg border border-neutral-800 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-bold mb-4">Need Assistance? Contact Us!</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Our team is here to help with any questions about your cloud mining journey. Reach out to us for personalized support and guidance.
        </p>
        <Link href="/contact">
          <Button className="bg-white text-black hover:bg-black hover:text-white rounded-full px-12 py-4 text-xl font-semibold transition-all duration-300">
            Contact Us Now
          </Button>
        </Link>
      </motion.section>
    </div>
  );
};

export default HashrateTab;