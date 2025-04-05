"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { STRIPE_PRODUCTS } from '@/config/stripe-products';

// HeroSection Component
const HeroSection = () => {
  const fadeInVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <motion.section
      className="relative h-screen bg-zinc-900/20 backdrop-blur-xl pt-40 pb-24 text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute top-0 left-0 bg-gradient-to-br from-white/50 via-white/35 to-transparent blur-[6rem] w-96 h-96 pointer-events-none" />
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "url('/noise.png') repeat" }} />

      <div className="relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center px-6 lg:px-12 py-12"
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="text-4xl md:text-5xl font-bold tracking-tight font-sans bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent py-12">
            Start Your Mining Journey Today
          </motion.h1>
          <p className="mt-2 text-lg md:text-xl text-zinc-300 leading-relaxed">
            Choose the perfect mining plan to maximize your Bitcoin earnings.
          </p>
          <Link href="#plans" passHref legacyBehavior>
            <Button
              asChild
              variant="default"
              size="lg"
              className="mt-8 px-8 py-3 bg-zinc-800/50 border border-zinc-700 text-white rounded-full hover:bg-zinc-700/50 transition-all duration-300"
            >
              <a className="cursor-pointer">Select a Plan</a>
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

// PlanSelector Component
const PlanSelector = ({ selectedPlan, setSelectedPlan }: { selectedPlan: string | null; setSelectedPlan: (plan: string) => void }) => {
  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md relative z-10">
      <h3 className="text-xl font-bold mb-4">Choose Your Time Plan</h3>
      <ul className="space-y-4">
        {Object.keys(STRIPE_PRODUCTS.plans).map((plan, index) => (
          <li key={index} className="relative">
            <button
              onClick={() => setSelectedPlan(plan)}
              className={`group w-full bg-white p-4 rounded-md shadow-sm hover:scale-105 overflow-hidden relative transition-all ${
                selectedPlan === plan ? 'ring-2 ring-zinc-800' : ''
              }`}
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                {plan}
              </span>
              <div className="absolute inset-0 bg-zinc-900/90 transition-all duration-500 transform -translate-x-full group-hover:translate-x-0 ease-out" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// HashRateSelector Component
const HashRateSelector = ({ selectedHashRate, setSelectedHashRate, renderGPUs }: { 
  selectedHashRate: string | null; 
  setSelectedHashRate: (hashRate: string) => void; 
  renderGPUs: () => React.ReactNode[] 
}) => {
  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md relative z-10">
      <h3 className="text-xl font-bold mb-4">Select Hash Rate</h3>
      <p className="text-sm text-gray-600 mb-4">Higher hash rates unlock more GPUs for better mining performance.</p>
      <ul className="space-y-4">
        {Object.keys(STRIPE_PRODUCTS.hashRates).map((feature, index) => (
          <li key={index} className="relative">
            <button
              onClick={() => setSelectedHashRate(feature)}
              className={`group w-full bg-white p-4 rounded-md shadow-sm overflow-hidden relative transition-all hover:scale-105 ${
                selectedHashRate === feature ? 'ring-2 ring-zinc-800' : ''
              }`}
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                {feature}
              </span>
              <div className="absolute inset-0 bg-black/90 transition-all duration-500 transform -translate-x-full group-hover:translate-x-0 ease-out" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-2">GPU Visualization</h4>
        <ul className="grid grid-cols-5 gap-4">{renderGPUs()}</ul>
      </div>
    </div>
  );
};

// MiningHosts Component
const MiningHosts = ({ setShowMiningHosts }: { setShowMiningHosts: (show: boolean) => void }) => {
  const locations = [
    { name: 'Ethiopia', image: '/et1.jpg' },
    { name: 'Dubai', image: '/dubai.jpg' },
    { name: 'USA', image: '/usa1.jpg' },
    { name: 'Canada', image: '/canada.jpg' },
    { name: 'Iceland', image: '/iceland.jpg' },
    { name: 'Norway', image: '/norway.jpg' },
  ];

  return (
    <motion.div
      key="miningHosts"
      className="relative py-14 px-6 text-white overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 from-black/60"
          transition={{ duration: 0.8 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="bg-black p-6 rounded-lg shadow-xl border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-3xl font-bold">Our Mining Locations</h3>
            <Button
              onClick={() => setShowMiningHosts(false)}
              className="bg-zinc-800/80 border border-zinc-700 text-white rounded-full hover:bg-zinc-700/80 transition-all duration-300"
            >
              Back to Plans
            </Button>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((location, index) => (
              <motion.li
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
              >
                <button className="group w-full bg-white/15 p-4 rounded-md shadow-sm overflow-hidden relative transition-all hover:scale-105">
                  <span className="relative z-10 block">
                    <div className="bg-white h-36 rounded-full relative overflow-hidden">
                      <Image
                        src={location.image}
                        alt={`${location.name} mining location`}
                        fill
                        className="object-cover object-center"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/60 group-hover:bg-black/10 transition-all duration-300" />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-lg font-semibold group-hover:text-white">{location.name}</p>
                      <p className="text-sm group-hover:text-white">Efficient Mining Infrastructure</p>
                      <p className="text-sm group-hover:text-white">0.05¢ / kWh</p>
                    </div>
                  </span>
                  <div className="absolute inset-0 bg-white/60 transition-all duration-500 transform -translate-x-full group-hover:translate-x-0 ease-out" />
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

// Main ProductPage Component
const ProductPage = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedHashRate, setSelectedHashRate] = useState<string | null>(null);
  const [showMiningHosts, setShowMiningHosts] = useState(false);

  const renderGPUs = () => {
    const totalGPUs = 20;
    let unlockedGPUs = 0;

    switch (selectedHashRate) {
      case "200 TH":
        unlockedGPUs = 3;
        break;
      case "300 TH":
        unlockedGPUs = 5;
        break;
      case "400 TH":
        unlockedGPUs = 8;
        break;
      case "500 TH":
        unlockedGPUs = 12;
        break;
      default:
        unlockedGPUs = 0;
    }

    return Array.from({ length: totalGPUs }, (_, index) => (
      <li key={index} className="relative">
        <img
          src={index < unlockedGPUs ? "/gpuunlocked.png" : "/gpulocked.png"}
          alt={index < unlockedGPUs ? "GPU Unlocked" : "GPU Locked"}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${
            index < unlockedGPUs ? "text-black" : "text-gray-400"
          }`}
        >
          {index < unlockedGPUs ? "Unlocked" : "Locked"}
        </span>
      </li>
    ));
  };

  const handleCheckout = () => {
    if (selectedPlan && selectedHashRate) {
      router.push(`/checkout?plan=${encodeURIComponent(selectedPlan)}&hashRate=${encodeURIComponent(selectedHashRate)}`);
    }
  };

  return (
    <section>
      <HeroSection />
      <motion.section
        id="plans"
        className="py-14 px-6 bg-white text-black"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        layout
      >
        <AnimatePresence mode="wait">
          {showMiningHosts ? (
            <MiningHosts key="miningHosts" setShowMiningHosts={setShowMiningHosts} />
          ) : (
            <motion.div
              key="plansContent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 relative z-5">
                <PlanSelector selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
                <div className="bg-gray-200 p-6 rounded-lg shadow-md relative z-10">
                  <h3 className="text-xl font-bold mb-4">Pricing Details</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-md shadow-sm text-center">
                      <h4 className="text-xl font-bold">$399</h4>
                      <p>One-Time Payment</p>
                    </div>
                    <div className="bg-white p-4 rounded-md shadow-sm text-center">
                      <h4 className="text-xl font-bold">$109</h4>
                      <p>Monthly Subscription</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-md shadow-sm text-center">
                    <p>24-Hour Overwatch<br />98% Uptime Guaranteed</p>
                  </div>
                </div>
              </div>

              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                <HashRateSelector
                  selectedHashRate={selectedHashRate}
                  setSelectedHashRate={setSelectedHashRate}
                  renderGPUs={renderGPUs}
                />
              </div>

              <div className="max-w-6xl mx-auto flex justify-between mt-12">
                <Button
                  variant="default"
                  size="lg"
                  className="px-12 py-4 bg-zinc-800/80 border border-zinc-700 text-white rounded-full hover:bg-zinc-700/80 transition-all duration-300 text-xl"
                  disabled={!selectedPlan || !selectedHashRate}
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="px-12 py-4 bg-zinc-800/80 border border-zinc-700 text-white rounded-full hover:bg-zinc-700/80 transition-all duration-300 text-xl"
                  onClick={() => setShowMiningHosts(true)}
                >
                  Explore Our Mining Pool
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </section>
  );
};

export default ProductPage;