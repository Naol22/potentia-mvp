"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconButton } from "@mui/material";
import { Brightness4, WbSunny } from "@mui/icons-material";

// Define available options with `as const` for TypeScript literal types
const cryptocurrencies = ["BTC", "ETH", "DOGE", "LTC"] as const;
type Crypto = (typeof cryptocurrencies)[number];

const plans = [
  "3 Months",
  "4 Months",
  "5 Months",
  "6 Months",
  "One-Time",
  "Monthly",
] as const;
type Plan = (typeof plans)[number];

const hashRates = ["200 TH", "300 TH", "400 TH", "500 TH"] as const;
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
      source: "Mixed",
      minerType: "Hydro Power",
      capacity: "30 MW",
      innovation: "Einspeisung ins Fernwärme Netz",
      surveillance: "24 hours",
    },
  },
  {
    name: "Dubai",
    image: "/dubai.jpg",
    hostingInfo: {
      price: "8.0ct / kWh",
      minOrder: "2 pieces",
      setupFee: "50,00 €",
    },
    generalInfo: {
      source: "Solar/Grid",
      minerType: "ASIC Miner",
      capacity: "15 MW",
      innovation: "Smart Grid Integration",
      surveillance: "24 hours",
    },
  },
  {
    name: "Texas, Fort Worth",
    image: "/Texas.jpg",
    hostingInfo: {
      price: "7.8ct / kWh",
      minOrder: "1 piece",
      setupFee: "1050,00 €",
    },
    generalInfo: {
      source: "Mains power",
      minerType: "Warehouse Miner",
      capacity: "25 MW",
      innovation: "Smart Grid Integration",
      surveillance: "24 hours",
    },
  },
  {
    name: "Paraguay, Villarica",
    image: "/para.jpg",
    hostingInfo: {
      price: "7.8ct / kWh",
      minOrder: "1 piece",
      setupFee: "50,00 €",
    },
    generalInfo: {
      source: "Hydro Power",
      minerType: "Warehouse Miner",
      capacity: "10 MW",
      innovation: "Smart Grid Integration",
      surveillance: "24 hours",
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
      innovation: "Smart Grid Integration",
      surveillance: "24 hours",
    },
  },
  {
    name: "Finland, Heat Recovery",
    image: "/dubai.jpg",
    hostingInfo: { price: "8.0ct / kWh", minOrder: "1 piece", setupFee: "-" },
    generalInfo: {
      source: "Mixed",
      minerType: "Hydro Miner",
      capacity: "10 MW",
      innovation: "Smart Grid Integration",
      surveillance: "24 hours",
    },
  },
];

// Pricing data with proper typing
const planBasePrices: Record<Plan, number> = {
  "3 Months": 300,
  "4 Months": 400,
  "5 Months": 500,
  "6 Months": 600,
  "One-Time": 1000,
  Monthly: 150,
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
  <svg
    className="w-5 h-5 inline-block ml-2"
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

// Chevron SVG for FAQ accordion
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

const HostingTab = () => {
  const router = useRouter();
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedHashRate, setSelectedHashRate] = useState<HashRate | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const totalPrice =
    selectedPlan && selectedHashRate
      ? planBasePrices[selectedPlan] + hashRateCosts[selectedHashRate]
      : 0;
  const unlockedGPUs = selectedHashRate
    ? hashRateToGPUs[selectedHashRate] || 0
    : 0;

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
        <span className="absolute bottom-2 right-2 text-xs text-white">
          {i < gpuCount ? "Unlocked" : "Locked"}
        </span>
      </motion.li>
    ));
  };

  const handleViewDetails = () => {
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
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "What is cloud mining?",
      answer:
        "Cloud mining is a process that allows individuals to participate in cryptocurrency mining without owning or managing physical hardware. Instead of purchasing expensive mining rigs, setting up cooling systems, and dealing with high electricity costs, you can rent hash power from remote data centers operated by companies like Potentia. We host and maintain the mining equipment in our state-of-the-art facilities, ensuring optimal performance and uptime. You simply choose a plan, select your preferred cryptocurrency, hash rate, and facility, and start earning mining rewards. Cloud mining is ideal for beginners and experienced miners alike, offering a hassle-free way to mine Bitcoin, Ethereum, and other cryptocurrencies while minimizing technical and financial risks.",
    },
    {
      question: "How do I choose a facility?",
      answer:
        "Choosing the right facility for your cloud mining operation depends on several factors, including electricity costs, capacity, and location-specific benefits. At Potentia, we offer a range of facilities worldwide, each with unique advantages. For example, our Ethiopia facility leverages hydro power for low-cost electricity at 4.0ct/kWh, making it ideal for cost-conscious miners. Our Dubai facility uses solar and grid power with smart grid integration, offering a balance of sustainability and performance. When selecting a facility, consider the price per kWh, setup fees, and minimum order requirements, which are displayed for each option. Additionally, think about the facility’s capacity—higher-capacity locations like Texas (25 MW) can handle larger mining operations. Use the 'View Facility' button to explore detailed information about each location, including power sources, miner types, and innovations, to make an informed decision that aligns with your mining goals.",
    },
    {
      question: "What are the payment options?",
      answer:
        "At Potentia, we strive to make the payment process as seamless and flexible as possible. We accept a variety of payment methods to accommodate users worldwide. You can pay using major cryptocurrencies such as Bitcoin (BTC), Ethereum (ETH), and Litecoin (LTC), ensuring fast and secure transactions directly from your crypto wallet. For those who prefer traditional payment methods, we also support credit and debit cards (Visa, MasterCard, and American Express) through our integration with Stripe, a trusted payment gateway. Additionally, we offer bank transfers for larger transactions, though processing times may vary depending on your bank. All payments are processed securely, and you’ll receive a confirmation email with your order details once the transaction is complete. If you have any issues or need assistance, our support team is available 24/7 to help you through the payment process.",
    },
  ];

  return (
    <motion.section
      className={`py-24 px-6 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="max-w-6xl mx-auto relative">
        {/* Theme Toggle Button */}
        <div className="absolute top-0 right-0 p-4">
          <IconButton
            className={`transition-colors duration-300 ${
              isDarkMode ? 'text-white bg-black' : 'text-black bg-white'
            } hover:bg-opacity-80`}
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <WbSunny /> : <Brightness4 />}
          </IconButton>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 text-center">
          <p className="text-sm text-black dark:text-white">
            Step 1: Select Crypto, Plan, Hash Rate & Facility
          </p>
          <div className="mt-2 h-1 w-32 bg-white dark:bg-black mx-auto rounded-full border border-gray-300 dark:border-neutral-700">
            <div className="h-full w-1/2 bg-black dark:bg-white rounded-full" />
          </div>
        </div>

        {/* Facilities Selection Section */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-md mb-12 border border-gray-300 dark:border-neutral-700">
          <h2 className="text-2xl font-bold mb-4 text-center text-black dark:text-white">
            Choose Your Mining Facility
          </h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory">
            {facilities.map((facility, index) => (
              <motion.div
                key={facility.name}
                className="flex-none w-64"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  onClick={() => setSelectedFacility(facility.name)}
                  className={`w-full p-4 text-left rounded-lg shadow-sm transition-all border border-gray-300 dark:border-neutral-700 ${
                    selectedFacility === facility.name
                      ? "bg-white dark:bg-black text-black dark:text-white opacity-80"
                      : "bg-white dark:bg-black text-black dark:text-gray-300 hover:opacity-80"
                  } snap-center`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedFacility(facility.name);
                    }
                  }}
                >
                  <img
                    src={facility.image}
                    alt={facility.name}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    {facility.name}
                  </h3>
                  <p className="text-sm text-black dark:text-white">
                    {facility.generalInfo.capacity} Capacity
                  </p>
                  <p className="text-sm text-black dark:text-white">
                    {facility.hostingInfo.price}
                  </p>
                  <Link href={`/facilities/${encodeURIComponent(facility.name)}`}>
                    <Button className="mt-2 w-full bg-white dark:bg-black text-black dark:text-white hover:opacity-80 rounded-full py-2 text-sm border border-gray-300 dark:border-neutral-700">
                      View Facility
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column */}
          <motion.div className="space-y-6">
            {/* Crypto Selection */}
            <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md border border-gray-300 dark:border-neutral-700">
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
                Select Cryptocurrency
              </h2>
              <div className="flex space-x-4">
                {cryptocurrencies.map((crypto) => (
                  <button
                    key={crypto}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`px-4 py-2 rounded-md transition border border-gray-300 dark:border-neutral-700 ${
                      selectedCrypto === crypto
                        ? "bg-white dark:bg-black text-black dark:text-white opacity-80"
                        : "bg-white dark:bg-black text-gray-600 dark:text-gray-300 hover:opacity-80"
                    }`}
                  >
                    {crypto}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Selector */}
            <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md border border-gray-300 dark:border-neutral-700">
              <h2 className="text-xl font-bold mb-2 text-black dark:text-white">
                Choose Your Plan
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Choose a plan duration that fits your mining goals. Longer plans offer better value.
              </p>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-4 text-left rounded-md transition-all border border-gray-300 dark:border-neutral-700 ${
                      selectedPlan === plan
                        ? "bg-white dark:bg-black text-black dark:text-white opacity-80"
                        : "bg-white dark:bg-black text-gray-600 dark:text-gray-300 hover:opacity-80"
                    }`}
                  >
                    <span>{plan}</span>
                    {selectedPlan === plan && <CheckmarkIcon />}
                  </button>
                ))}
              </div>
            </div>

            {/* Hash Rate Selector */}
            <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md border border-gray-300 dark:border-neutral-700">
              <h2 className="text-xl font-bold mb-2 text-black dark:text-white">
                Select Hash Rate
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Select a hash rate to determine your mining power.
              </p>
              <div className="space-y-4">
                {hashRates.map((rate) => (
                  <div key={rate} className="group relative">
                    <button
                      onClick={() => setSelectedHashRate(rate)}
                      className={`w-full p-4 text-left rounded-md transition-all border border-gray-300 dark:border-neutral-700 ${
                        selectedHashRate === rate
                          ? "bg-white dark:bg-black text-black dark:text-white opacity-80"
                          : "bg-white dark:bg-black text-gray-600 dark:text-gray-300 hover:opacity-80"
                      }`}
                    >
                      <span>{rate}</span>
                      {selectedHashRate === rate && <CheckmarkIcon />}
                    </button>
                    <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-white dark:bg-black text-black dark:text-white text-xs rounded-md px-2 py-1 z-10 border border-gray-300 dark:border-neutral-700">
                      Unlocks {hashRateToGPUs[rate]} GPUs
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Order Summary */}
          <motion.div
            className="bg-white dark:bg-black p-8 rounded-lg shadow-md border border-gray-300 dark:border-neutral-700 md:sticky md:top-4"
          >
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
              Order Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Cryptocurrency:</span>
                <span className="font-medium text-black dark:text-white">
                  {selectedCrypto || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Plan:</span>
                <span className="font-medium text-black dark:text-white">
                  {selectedPlan || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Hash Rate:</span>
                <span className="font-medium text-black dark:text-white">
                  {selectedHashRate || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Facility:</span>
                <span className="font-medium text-black dark:text-white">
                  {selectedFacility || "Not selected"}
                </span>
              </div>
              {selectedFacility && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>
                    Price per kWh:{" "}
                    {facilities.find((f) => f.name === selectedFacility)?.hostingInfo.price}
                  </p>
                  <p>
                    Setup Fee:{" "}
                    {facilities.find((f) => f.name === selectedFacility)?.hostingInfo.setupFee}
                  </p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Unlocked GPUs:</span>
                <span className="font-medium text-black dark:text-white">
                  {unlockedGPUs} / 20
                </span>
              </div>
              <div className="border-t border-gray-300 dark:border-neutral-700 my-4" />
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
                          <span className="text-gray-600 dark:text-gray-300">Monthly Price:</span>
                          <span className="font-medium text-black dark:text-white">
                            ${planBasePrices[selectedPlan]}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">One-Time Fee:</span>
                          <span className="font-medium text-black dark:text-white">
                            ${hashRateCosts[selectedHashRate]}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between font-bold text-xl text-black dark:text-white">
                        <span>Total Price:</span>
                        <span>${totalPrice}</span>
                      </div>
                    )}
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                      <p>Estimated Output: 0.001 BTC/month (based on current rates)</p>
                    </div>
                    {selectedPlan === "6 Months" && (
                      <div className="mt-2 inline-block bg-white dark:bg-black text-black dark:text-white px-3 py-1 rounded-full text-sm border border-gray-300 dark:border-neutral-700">
                        Save 10% with 6 Months
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {selectedHashRate && (
                <motion.div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
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
                  ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } }
                  : {}
              }
            >
              <Button
                className="w-full bg-white dark:bg-black text-black dark:text-white hover:opacity-80 disabled:opacity-50 disabled:text-gray-400 rounded-full py-4 text-lg border border-gray-300 dark:border-neutral-700"
                disabled={!selectedPlan || !selectedHashRate || !selectedFacility}
                onClick={handleViewDetails}
              >
                Check Details
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white dark:bg-black p-6 rounded-lg shadow-md border border-gray-300 dark:border-neutral-700">
          <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
            About Hosting Services
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Our hosting services at Potentia empower you to mine cryptocurrencies effortlessly...
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white dark:bg-black p-6 rounded-lg shadow-md border border-gray-300 dark:border-neutral-700">
          <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-300 dark:border-neutral-700 py-4">
                <button
                  className="w-full flex justify-between items-center text-lg font-semibold cursor-pointer text-left text-black dark:text-white"
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
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default HostingTab;