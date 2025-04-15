"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();

  // Safely parse query parameters with type checking
  const parseNumberParam = (param: string | null, defaultValue: number): number => {
    const value = param ? parseFloat(param) : NaN;
    return isNaN(value) ? defaultValue : value;
  };

  const hashrate = parseNumberParam(searchParams.get("hashrate"), 100);
  const price = parseNumberParam(searchParams.get("price"), 5);
  const machines = parseNumberParam(searchParams.get("machines"), 1);
  const model = searchParams.get("model") || "antminer-s21";

  // Form state for user details and payment
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    btcAddress: "",
  });

  // State for dynamic summary
  const [animatedTotalSold, setAnimatedTotalSold] = useState<number>(0);

  // Calculate summary details
  const estimatedOutput = hashrate * 0.0005;
  const hashRateFee = (0.00317 * hashrate).toFixed(2);
  const electricityFee = (0.0059 * hashrate).toFixed(2);
  const totalSold = Math.min((machines / 15) * 100, 100);

  useEffect(() => {
    const totalSoldTimeout = setTimeout(() => setAnimatedTotalSold(totalSold), 100);
    return () => clearTimeout(totalSoldTimeout);
  }, [totalSold]);

  // Animation variants
  const statVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: i * 0.1 },
    }),
  };

  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Log the order details (placeholder for backend integration)
    console.log({
      ...formData,
      hashrate,
      price,
      model,
      machines,
      estimatedOutput,
      hashRateFee,
      electricityFee,
    });
    alert("Purchase confirmed! You will receive a confirmation email shortly.");
  };

  return (
    <div className="bg-black text-white mt-[100px] py-12 px-4 overflow-x-hidden font-['Inter']">
      {/* Main Section */}
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
            <h2 className="text-2xl font-bold mb-4">Antminer S21 - {hashrate} TH/s</h2>
            <div className="space-y-2 text-sm">
              <motion.p
                variants={statVariants}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                <span className="mr-2">📊</span> Hash Rate Fee: ${hashRateFee}
              </motion.p>
              <motion.p
                variants={statVariants}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                <span className="mr-2">⚡</span> Electricity Fee: ${electricityFee}
              </motion.p>
              <motion.p
                variants={statVariants}
                initial="hidden"
                animate="visible"
                custom={2}
              >
                <span className="mr-2">⏰</span> Static Output: {estimatedOutput.toFixed(4)} BTC/month
              </motion.p>
              <motion.p
                variants={statVariants}
                initial="hidden"
                animate="visible"
                custom={3}
              >
                <span className="mr-2">📅</span> Duration: Monthly Recurring
              </motion.p>
              <motion.p
                variants={statVariants}
                initial="hidden"
                animate="visible"
                custom={4}
                className="text-lg font-bold mt-2"
              >
                Total: ${price.toFixed(2)}
              </motion.p>
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

        {/* Right: Payment Form */}
        <motion.div
          className="bg-neutral-800 p-8 rounded-xl shadow-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Complete Your Purchase</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-white/20"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-white/20"
                placeholder="john.doe@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="btcAddress">
                BTC Address for Payouts
              </label>
              <input
                type="text"
                id="btcAddress"
                name="btcAddress"
                value={formData.btcAddress}
                onChange={handleInputChange}
                className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-white/20"
                placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                required
              />
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-black hover:text-white rounded-full py-4 text-lg font-semibold transition-all"
              >
                Confirm Purchase
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </motion.section>
    </div>
  );
}