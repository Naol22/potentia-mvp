"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define available options with `as const` for TypeScript literal types
const cryptocurrencies = ["BTC", "ETH", "DOGE", "LTC"] as const;
type Crypto = typeof cryptocurrencies[number];

const plans = ["3 Months", "4 Months", "5 Months", "6 Months", "One-Time", "Monthly"] as const;
type Plan = typeof plans[number];

const hashRates = ["200 TH", "300 TH", "400 TH", "500 TH"] as const;
type HashRate = typeof hashRates[number];

const facilities = [
  {
    name: "Ethiopia",
    image: "/ethio.jpg",
    hostingInfo: { price: "4.0ct / kWh", minOrder: "1 piece", setupFee: "$150" },
    generalInfo: { source: "Mixed", minerType: "Hydro Power", capacity: "30 MW", innovation: "Einspeisung ins Fernwärme Netz", surveillance: "24 hours" },
  },
  {
    name: "Dubai",
    image: "/dubai.jpg",
    hostingInfo: { price: "8.0ct / kWh", minOrder: "2 pieces", setupFee: "50,00 €" },
    generalInfo: { source: "Solar/Grid", minerType: "ASIC Miner", capacity: "15 MW", innovation: "Smart Grid Integration", surveillance: "24 hours" },
  },
  {
    name: "Texas, Fort Worth",
    image: "/Texas.jpg",
    hostingInfo: { price: "7.8ct / kWh", minOrder: "1 piece", setupFee: "1050,00 €" },
    generalInfo: { source: "Mains power", minerType: "Warehouse Miner", capacity: "25 MW", innovation: "Smart Grid Integration", surveillance: "24 hours" },
  },
  {
    name: "Paraguay, Villarica",
    image: "/para.jpg",
    hostingInfo: { price: "7.8ct / kWh", minOrder: "1 piece", setupFee: "50,00 €" },
    generalInfo: { source: "Hydro Power", minerType: "Warehouse Miner", capacity: "10 MW", innovation: "Smart Grid Integration", surveillance: "24 hours" },
  },
  {
    name: "Georgia, Tbilisi",
    image: "/geo.jpg",
    hostingInfo: { price: "10.5ct / kWh", minOrder: "1 piece", setupFee: "-" },
    generalInfo: { source: "Hydro Power", minerType: "Warehouse/Container", capacity: "5 MW", innovation: "Smart Grid Integration", surveillance: "24 hours" },
  },
  {
    name: "Finland, Heat Recovery",
    image: "/dubai.jpg",
    hostingInfo: { price: "8.0ct / kWh", minOrder: "1 piece", setupFee: "-" },
    generalInfo: { source: "Mixed", minerType: "Hydro Miner", capacity: "10 MW", innovation: "Smart Grid Integration", surveillance: "24 hours" },
  },
];

// Pricing data with proper typing
const planBasePrices: Record<Plan, number> = {
  "3 Months": 300,
  "4 Months": 400,
  "5 Months": 500,
  "6 Months": 600,
  "One-Time": 1000,
  "Monthly": 150,
};

const hashRateCosts: Record<HashRate, number> = {
  "200 TH": 0,
  "300 TH": 100,
  "400 TH": 200,
  "500 TH": 300,
};

const hashRateToGPUs: Record<HashRate, number> = {
  "200 TH": 3,
  "300 TH": 5,
  "400 TH": 8,
  "500 TH": 12,
};

// Checkmark SVG
const CheckmarkIcon = () => (
  <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const HostingTab = () => {
  const router = useRouter();
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedHashRate, setSelectedHashRate] = useState<HashRate | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);

  const totalPrice = selectedPlan && selectedHashRate ? planBasePrices[selectedPlan] + hashRateCosts[selectedHashRate] : 0;
  const unlockedGPUs = selectedHashRate ? hashRateToGPUs[selectedHashRate] || 0 : 0;

  const renderGPUs = () => {
    const totalGPUs = 20;
    const gpuCount = unlockedGPUs;
    return Array.from({ length: totalGPUs }, (_, i) => (
      <motion.li
        key={i}
        className="relative"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: i * 0.05 }}
      >
        <img
          src={i < gpuCount ? "/gpuunlocked.png" : "/gpulocked.png"}
          alt={i < gpuCount ? "GPU Unlocked" : "GPU Locked"}
          className="w-full h-full object-cover"
        />
        <span className={`absolute bottom-2 right-2 text-xs ${i < gpuCount ? "text-black" : "text-gray-400"}`}>
          {i < gpuCount ? "Unlocked" : "Locked"}
        </span>
      </motion.li>
    ));
  };

  const handleViewDetails = () => {
    if (selectedPlan && selectedHashRate && selectedFacility) {
      router.push(
        `/details?crypto=${encodeURIComponent(selectedCrypto || "")}&duration=${encodeURIComponent(selectedPlan)}&hashRate=${encodeURIComponent(selectedHashRate)}&facility=${encodeURIComponent(selectedFacility)}`
      );
    }
  };

  return (
    <motion.section className="py-24 px-6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <p className="text-sm text-gray-500">Step 1: Select Crypto, Plan, Hash Rate & Facility</p>
          <div className="mt-2 h-1 w-32 bg-gray-200 mx-auto rounded-full">
            <div className="h-full w-1/2 bg-black rounded-full" />
          </div>
        </div>

        {/* Facilities Selection Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg shadow-md mb-12">
          <h2 className="text-2xl font-bold mb-4 text-center">Choose Your Mining Facility</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory">
            {facilities.map((facility, index) => (
              <motion.div
                key={facility.name}
                className="flex-none w-64"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  onClick={() => setSelectedFacility(facility.name)}
                  className={`w-full p-4 text-left rounded-lg shadow-sm transition-all border ${
                    selectedFacility === facility.name ? "bg-black text-white border-black" : "bg-white text-black border-gray-200 hover:scale-105"
                  } snap-center`}
                >
                  <img src={facility.image} alt={facility.name} className="w-full h-32 object-cover rounded-md mb-2" />
                  <h3 className="text-lg font-semibold">{facility.name}</h3>
                  <p className="text-sm text-gray-600">{facility.generalInfo.capacity} Capacity</p>
                  <p className="text-sm text-gray-600">{facility.hostingInfo.price}</p>
                  <Link href={`/facilities/${encodeURIComponent(facility.name)}`}>
                    <Button className="mt-2 w-full bg-gray-200 text-black hover:bg-gray-300 rounded-full py-2 text-sm">
                      View Facility
                    </Button>
                  </Link>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Crypto Selection */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Select Cryptocurrency</h2>
              <div className="flex space-x-4">
                {cryptocurrencies.map((crypto) => (
                  <button
                    key={crypto}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`px-4 py-2 rounded-md transition ${
                      selectedCrypto === crypto ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {crypto}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Selector */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-sm text-gray-600 mb-4">
                Choose a plan duration that fits your mining goals. Longer plans offer better value.
              </p>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-4 text-left rounded-md transition-all flex items-center justify-between ${
                      selectedPlan === plan ? "bg-black text-white" : "bg-gray-50 text-black border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <span>{plan}</span>
                    {selectedPlan === plan && <CheckmarkIcon />}
                  </button>
                ))}
              </div>
            </div>

            {/* Hash Rate Selector */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-bold mb-2">Select Hash Rate</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select a hash rate to determine your mining power. Higher rates unlock more GPUs and increase potential earnings.
              </p>
              <div className="space-y-4">
                {hashRates.map((rate) => (
                  <div key={rate} className="group relative">
                    <button
                      onClick={() => setSelectedHashRate(rate)}
                      className={`w-full p-4 text-left rounded-md transition-all flex items-center justify-between ${
                        selectedHashRate === rate ? "bg-black text-white" : "bg-gray-50 text-black border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span>{rate}</span>
                      {selectedHashRate === rate && <CheckmarkIcon />}
                    </button>
                    <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-black text-white text-xs rounded-md px-2 py-1 z-10">
                      Unlocks {hashRateToGPUs[rate]} GPUs
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Order Summary */}
          <motion.div
            className="bg-gradient-to-b from-white to-gray-50 p-8 rounded-lg shadow-md border border-gray-200 md:sticky md:top-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Cryptocurrency:</span>
                <span className="font-medium">{selectedCrypto || "Not selected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">{selectedPlan || "Not selected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hash Rate:</span>
                <span className="font-medium">{selectedHashRate || "Not selected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Facility:</span>
                <span className="font-medium">{selectedFacility || "Not selected"}</span>
              </div>
              {selectedFacility && (
                <div className="text-sm text-gray-600">
                  <p>Price per kWh: {facilities.find((f) => f.name === selectedFacility)?.hostingInfo.price}</p>
                  <p>Setup Fee: {facilities.find((f) => f.name === selectedFacility)?.hostingInfo.setupFee}</p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Unlocked GPUs:</span>
                <span className="font-medium">{unlockedGPUs} / 20</span>
              </div>
              <div className="border-t border-gray-200 my-4" />
              <AnimatePresence>
                {selectedPlan && selectedHashRate && selectedFacility && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {selectedPlan === "Monthly" ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Price:</span>
                          <span className="font-medium">${planBasePrices[selectedPlan]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">One-Time Fee:</span>
                          <span className="font-medium">${hashRateCosts[selectedHashRate]}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between font-bold text-xl">
                        <span>Total Price:</span>
                        <span>${totalPrice}</span>
                      </div>
                    )}
                    <div className="mt-4 text-sm text-gray-600">
                      <p>Estimated Output: 0.001 BTC/month (based on current rates)</p>
                    </div>
                    {selectedPlan === "6 Months" && (
                      <div className="mt-2 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        Save 10% with 6 Months
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {selectedHashRate && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-lg font-semibold mb-2">GPU Visualization</h3>
                  <ul className="grid grid-cols-5 gap-4">{renderGPUs()}</ul>
                </motion.div>
              )}
            </div>
            <motion.div
              className="mt-6"
              animate={
                selectedPlan && selectedHashRate && selectedFacility
                  ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } }
                  : {}
              }
            >
              <Button
                className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 rounded-full py-4 text-lg"
                disabled={!selectedPlan || !selectedHashRate || !selectedFacility}
                onClick={handleViewDetails}
              >
                Check Details
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default HostingTab;