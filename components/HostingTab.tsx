"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define types for selections
const cryptocurrencies = ["BTC", "ETH", "DOGE", "LTC"] as const;
type Crypto = (typeof cryptocurrencies)[number];

const plans = [
  "3 Months",
  "4 Months",
  "5 Months",
  "6 Months",
  "Monthly",
] as const;
type Plan = (typeof plans)[number];

// Updated hashRates
const hashRates = [
  "100 TH",
  "300 TH",
  "500 TH",
  "1000 TH",
  "1500 TH",
  "2000 TH",
  "2500 TH",
  "3000 TH",
] as const;
type HashRate = (typeof hashRates)[number];

const facilities = [
  {
    name: "Ethiopia",
    image: "/ethio.jpg",
    hostingInfo: {
      price: "4.0ct / kWh",
      minOrder: "1 piece",
      setupFee: "$150",
    },
    generalInfo: {
      source: "Hydro Power",
      minerType: "ASIC Miner",
      capacity: "30 MW",
      innovation: "Heat Recovery System",
      surveillance: "24/7",
      uptime: "99.9%",
      ecoFriendly: true,
    },
  },
  {
    name: "Dubai",
    image: "/ethio.jpg",
    hostingInfo: {
      price: "8.0ct / kWh",
      minOrder: "2 pieces",
      setupFee: "$50",
    },
    generalInfo: {
      source: "Solar/Grid",
      minerType: "ASIC Miner",
      capacity: "15 MW",
      innovation: "Smart Grid Integration",
      surveillance: "24/7",
      uptime: "99.8%",
      ecoFriendly: true,
    },
  },
  {
    name: "Texas, Fort Worth",
    image: "/Texas.jpg",
    hostingInfo: {
      price: "7.8ct / kWh",
      minOrder: "1 piece",
      setupFee: "$1050",
    },
    generalInfo: {
      source: "Mains Power",
      minerType: "Warehouse Miner",
      capacity: "25 MW",
      innovation: "Advanced Cooling",
      surveillance: "24/7",
      uptime: "99.7%",
      ecoFriendly: true,
    },
  },
  {
    name: "Paraguay, Villarica",
    image: "/para.jpg",
    hostingInfo: { price: "7.8ct / kWh", minOrder: "1 piece", setupFee: "$50" },
    generalInfo: {
      source: "Hydro Power",
      minerType: "Warehouse Miner",
      capacity: "10 MW",
      innovation: "Smart Grid Integration",
      surveillance: "24/7",
      uptime: "99.9%",
      ecoFriendly: true,
    },
  },
  {
    name: "Georgia, Tbilisi",
    image: "/geo.jpg",
    hostingInfo: { price: "10.5ct / kWh", minOrder: "1 piece", setupFee: "-" },
    generalInfo: {
      source: "Hydro Power",
      minerType: "Warehouse/Container",
      capacity: "5 MW",
      innovation: "Modular Design",
      surveillance: "24/7",
      uptime: "99.6%",
      ecoFriendly: true,
    },
  },
  {
    name: "Finland, Heat Recovery",
    image: "/ethio.jpg",
    hostingInfo: { price: "8.0ct / kWh", minOrder: "1 piece", setupFee: "-" },
    generalInfo: {
      source: "Mixed",
      minerType: "Hydro Miner",
      capacity: "10 MW",
      innovation: "District Heating Integration",
      surveillance: "24/7",
      uptime: "99.8%",
      ecoFriendly: true,
    },
  },
];

// Pricing data
const planBasePrices: Record<Plan, number> = {
  "3 Months": 300,
  "4 Months": 400,
  "5 Months": 500,
  "6 Months": 600,
  Monthly: 150,
};

// Updated hashRateCosts
const hashRateCosts: Record<HashRate, number> = {
  "100 TH": 5,
  "300 TH": 15,
  "500 TH": 25,
  "1000 TH": 50,
  "1500 TH": 75,
  "2000 TH": 100,
  "2500 TH": 125,
  "3000 TH": 150,
};

// Updated hashRateToGPUs
const hashRateToGPUs: Record<HashRate, number> = {
  "100 TH": 1,
  "300 TH": 2,
  "500 TH": 3,
  "1000 TH": 5,
  "1500 TH": 7,
  "2000 TH": 10,
  "2500 TH": 12,
  "3000 TH": 15,
};

// Icons
const CheckmarkIcon = () => (
  <svg
    className="w-5 h-5 inline-block ml-2 text-green-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const EcoBadge = () => (
  <span className="inline-block bg-green-500 text-white text-center text-xs px-2 py-1 rounded-full my-3 w-24">
    Eco-Friendly
  </span>
);

const HostingTab = () => {
  const router = useRouter();
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedHashRate, setSelectedHashRate] = useState<HashRate | null>(
    null
  );
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [animatedPrice, setAnimatedPrice] = useState(0);

  const totalPrice =
    selectedPlan && selectedHashRate
      ? planBasePrices[selectedPlan] + hashRateCosts[selectedHashRate]
      : 0;
  const unlockedGPUs = selectedHashRate
    ? hashRateToGPUs[selectedHashRate] || 0
    : 0;

  // Animate price counter
  useEffect(() => {
    if (totalPrice > 0) {
      const start = animatedPrice;
      const end = totalPrice;
      const duration = 1000;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentPrice = Math.floor(start + (end - start) * progress);
        setAnimatedPrice(currentPrice);
        if (progress < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }
  }, [totalPrice]);

  const renderGPUs = () => {
    const totalGPUs = 20;
    return Array.from({ length: totalGPUs }, (_, i) => (
      <motion.li
        key={i}
        className="relative"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: i * 0.1 }}
      >
        <img
          src={i < unlockedGPUs ? "/gpuunlocked.png" : "/gpulocked.png"}
          alt={i < unlockedGPUs ? "GPU Unlocked" : "GPU Locked"}
          className="w-full h-full object-cover rounded-md"
        />
        <span className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
          {i < unlockedGPUs ? "Unlocked" : "Locked"}
        </span>
      </motion.li>
    ));
  };

  const handleViewDetails = () => {
    setShowModal(true);
  };

  const confirmDetails = () => {
    if (selectedPlan && selectedHashRate && selectedFacility) {
      router.push(
        `/details?crypto=${encodeURIComponent(
          selectedCrypto || ""
        )}&duration=${encodeURIComponent(
          selectedPlan
        )}&hashRate=${encodeURIComponent(
          selectedHashRate
        )}&facility=${encodeURIComponent(selectedFacility)}`
      );
    }
    setShowModal(false);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "What is cloud mining and how does it work?",
      answer:
        "Cloud mining lets you mine cryptocurrencies like Bitcoin without managing hardware. At Potentia, you rent hash power from our advanced data centers, where we handle setup, maintenance, and power. Choose a cryptocurrency, plan, hash rate, and facility, and we allocate resources to your account. Rewards are based on your hash rate and network difficulty, paid directly to your wallet. It’s simple and ideal for all experience levels.",
    },
    {
      question: "How do I choose the best facility for my needs?",
      answer:
        "Pick a facility based on electricity cost, capacity, or location benefits. Ethiopia offers 4.0ct/kWh with hydro power, great for savings. Dubai uses solar/grid with smart tech for reliability. Texas supports larger operations with 25 MW capacity. Check each facility’s price, setup fees, and power source via the 'View Facility' button to match your mining goals.",
    },
    {
      question: "What are the payment options and refund policies?",
      answer:
        "We accept Bitcoin, Ethereum, Litecoin, credit/debit cards (Visa, MasterCard, Amex) via Stripe, and bank transfers. Crypto and card payments are instant; bank transfers may take longer. Refunds are available within 7 days if mining hasn’t started, with a 5% fee. Reach our 24/7 support for payment or refund help.",
    },
    {
      question: "How profitable is cloud mining with Potentia?",
      answer:
        "Profits vary by hash rate, plan, facility, and market conditions. A 500 TH hash rate in Ethiopia might yield ~0.001 BTC/month, depending on Bitcoin’s price and difficulty. Our low-cost facilities maximize returns. We’re adding a profitability calculator soon to help estimate earnings.",
    },
    {
      question: "How secure are your hosting facilities?",
      answer:
        "Our facilities have 24/7 surveillance, biometric access, and backup power for up to 99.9% uptime. Your data is encrypted end-to-end, and rewards are securely transferred. Regular audits ensure compliance, so you can mine with confidence.",
    },
    {
      question: "Can I scale my mining operation over time?",
      answer:
        "Yes! Start small and scale up by adding hash power, extending plans, or switching facilities. Our Texas and Ethiopia sites support large-scale mining with up to 30 MW capacity. Contact us to tailor a plan that grows with you.",
    },
  ];

  return (
    <motion.section
      className="py-24 px-6 bg-black text-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Full-Width Facility Section */}
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
          <div className="bg-black p-6 rounded-lg shadow-md mb-12 border-neutral-600 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center text-white">
              Choose Your Mining Facility
            </h2>
            <div
              className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory w-screen ml-2 pl-1 pr-96"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <style jsx global>{`
                .flex::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {facilities.map((facility, index) => (
                <motion.div
                  key={facility.name}
                  className="flex-none w-80"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div
                    onClick={() => setSelectedFacility(facility.name)}
                    className={`w-full h-full flex flex-col text-left rounded-lg shadow-sm transition-all bg-neutral-800 text-white hover:bg-neutral-800 snap-center p-4 cursor-pointer ${
                      selectedFacility === facility.name ? "opacity-80" : ""
                    }`}
                  >
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="w-full h-48 object-cover rounded-md mb-2"
                    />
                    <h3 className="text-lg font-semibold truncate my-2">
                      {facility.name}
                    </h3>
                    <p className="text-sm flex-1 my-2">
                      {facility.generalInfo.capacity} Capacity
                    </p>
                    <p className="text-sm my-2">{facility.hostingInfo.price}</p>
                    {facility.generalInfo.ecoFriendly && <EcoBadge />}
                    <Link
                      href={`/facilities/${encodeURIComponent(facility.name)}`}
                      className="mt-auto"
                    >
                      <Button className="w-full bg-black text-white hover:bg-neutral-800 rounded-full py-2 text-sm border border-neutral-300">
                        View Facility
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Other sections remain within max-w-6xl */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column: Selections */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Crypto Selection */}
            <div className="bg-neutral-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-white">
                Select Cryptocurrency
              </h2>
              <p className="text-sm text-white mb-4">
                Choose the cryptocurrency you want to mine.
              </p>
              <div className="flex flex-wrap gap-4">
                {cryptocurrencies.map((crypto) => (
                  <motion.button
                    key={crypto}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`px-4 py-2 rounded-md transition border border-neutral-600 ${
                      selectedCrypto === crypto
                        ? "bg-black text-white opacity-80"
                        : "bg-black text-white hover:opacity-80"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {crypto}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Plan Selector */}
            <div className="bg-neutral-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2 text-white">
                Choose Your Plan
              </h2>
              <p className="text-sm text-white mb-4">
                Select a duration that fits your mining goals.
              </p>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <motion.button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-4 text-left rounded-md transition-all border border-neutral-600 flex justify-between items-center ${
                      selectedPlan === plan
                        ? "bg-black text-white opacity-80"
                        : "bg-black text-white hover:opacity-80"
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <span>{plan}</span>
                    {selectedPlan === plan && <CheckmarkIcon />}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Hash Rate Selector */}
            <div className="bg-neutral-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2 text-white">
                Select Hash Rate
              </h2>
              <p className="text-sm text-white mb-4">
                Higher hash rates boost your mining power.
              </p>
              <div className="space-y-4">
                {hashRates.map((rate) => (
                  <div key={rate} className="group relative">
                    <motion.button
                      onClick={() => setSelectedHashRate(rate)}
                      className={`w-full p-4 text-left rounded-md transition-all border border-neutral-300 flex justify-between items-center ${
                        selectedHashRate === rate
                          ? "bg-black text-white opacity-80"
                          : "bg-black text-white hover:opacity-80"
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <span>{rate}</span>
                      {selectedHashRate === rate && <CheckmarkIcon />}
                    </motion.button>
                    <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-black text-white text-xs rounded-md px-2 py-1 z-10 border border-neutral-300">
                      Unlocks {hashRateToGPUs[rate]} GPUs
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Order Summary */}
          <motion.div
            className="bg-neutral-800 p-8 rounded-lg shadow-md md:sticky md:top-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-white">
              Order Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-white">Cryptocurrency:</span>
                <span className="font-medium text-white">
                  {selectedCrypto || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Plan:</span>
                <span className="font-medium text-white">
                  {selectedPlan || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Hash Rate:</span>
                <span className="font-medium text-white">
                  {selectedHashRate || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Facility:</span>
                <span className="font-medium text-white">
                  {selectedFacility || "Not selected"}
                </span>
              </div>
              {selectedFacility && (
                <div className="text-sm text-white">
                  <p>
                    Price per kWh:{" "}
                    {
                      facilities.find((f) => f.name === selectedFacility)
                        ?.hostingInfo.price
                    }
                  </p>
                  <p>
                    Setup Fee:{" "}
                    {
                      facilities.find((f) => f.name === selectedFacility)
                        ?.hostingInfo.setupFee
                    }
                  </p>
                  <p>
                    Uptime:{" "}
                    {
                      facilities.find((f) => f.name === selectedFacility)
                        ?.generalInfo.uptime
                    }
                  </p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white">Unlocked GPUs:</span>
                <span className="font-medium text-white">
                  {unlockedGPUs} / 20
                </span>
              </div>
              <div className="border-t border-neutral-300 my-4" />
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
                          <span className="text-white">Monthly Price:</span>
                          <motion.span
                            className="font-medium text-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            ${planBasePrices[selectedPlan]}
                          </motion.span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white">One-Time Fee:</span>
                          <motion.span
                            className="font-medium text-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            ${hashRateCosts[selectedHashRate]}
                          </motion.span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between font-bold text-xl text-white">
                        <span>Total Price:</span>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          ${animatedPrice}
                        </motion.span>
                      </div>
                    )}
                    <div className="mt-4 text-sm text-white">
                      <p>
                        Estimated Output: ~0.001 BTC/month (varies with market)
                      </p>
                    </div>
                    {selectedPlan === "6 Months" && (
                      <motion.div
                        className="mt-2 inline-block bg-neutral-800 text-white px-3 py-1 rounded-full text-sm border border-neutral-300"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        Save 10% with 6 Months
                      </motion.div>
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
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    GPU Visualization
                  </h3>
                  <ul className="grid grid-cols-5 gap-4">{renderGPUs()}</ul>
                </motion.div>
              )}
            </div>
            <motion.div
              className="mt-6"
              animate={
                selectedPlan && selectedHashRate && selectedFacility
                  ? {
                      scale: [1, 1.05, 1],
                      transition: { repeat: Infinity, duration: 1.5 },
                    }
                  : {}
              }
            >
              <Button
                className="w-full bg-black text-white hover:opacity-80 disabled:opacity-50 disabled:text-neutral-400 rounded-full py-4 text-lg border border-neutral-300"
                disabled={
                  !selectedPlan || !selectedHashRate || !selectedFacility
                }
                onClick={handleViewDetails}
              >
                Check Details
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-black p-8 rounded-lg shadow-xl border border-neutral-600 max-w-md w-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Confirm Your Selection
                </h3>
                <p className="text-white mb-6">
                  You’ve selected {selectedCrypto}, {selectedPlan},{" "}
                  {selectedHashRate}, and {selectedFacility}. Proceed to view
                  details?
                </p>
                <div className="flex justify-end gap-4">
                  <Button
                    className="bg-neutral-800 text-white hover:bg-neutral-700 rounded-full py-2 px-6 border border-neutral-300"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-black text-white hover:bg-neutral-800 rounded-full py-2 px-6 border border-neutral-300"
                    onClick={confirmDetails}
                  >
                    Confirm
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        <motion.div
          className="mt-12 bg-black p-6 rounded-lg shadow-md border border-neutral-600"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-white">
            Why Choose Our Hosting Services?
          </h2>
          <p className="text-white leading-relaxed mb-6">
            Potentia’s hosting services make cryptocurrency mining accessible
            and efficient. We manage state-of-the-art facilities worldwide,
            handling hardware, power, and maintenance so you can focus on
            earning rewards. Our data centers in Ethiopia, Dubai, Texas, and
            more offer low electricity rates, advanced cooling, and 24/7
            security. Whether you’re new or experienced, our scalable solutions
            maximize profits with minimal hassle.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              className="p-6 bg-black rounded-lg border border-neutral-600"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-xl font-semibold mb-2 text-white">
                Global Facilities
              </h3>
              <p className="text-sm text-white">
                Mine from top-tier data centers across multiple continents,
                optimized for cost and performance.
              </p>
            </motion.div>
            <motion.div
              className="p-6 bg-black rounded-lg border border-neutral-600"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-xl font-semibold mb-2 text-white">
                Sustainable Mining
              </h3>
              <p className="text-sm text-white">
                Use hydro and solar-powered facilities like Ethiopia and Dubai
                for eco-friendly operations.
              </p>
            </motion.div>
            <motion.div
              className="p-6 bg-black rounded-lg border border-neutral-600"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-xl font-semibold mb-2 text-white">
                Round-the-Clock Support
              </h3>
              <p className="text-sm text-white">
                Our team is available 24/7 to ensure your mining runs smoothly.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="mt-12 bg-black p-6 rounded-lg shadow-md border border-neutral-600"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="border-b border-neutral-300 py-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  className="w-full flex justify-between items-center text-lg font-semibold cursor-pointer text-left text-white"
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{faq.question}</span>
                  <ChevronIcon isOpen={openFAQ === index} />
                </button>
                <AnimatePresence>
                  {openFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-white leading-relaxed mt-2">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HostingTab;