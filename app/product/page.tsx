"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PRODUCTS } from '@/config/stripe-products';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const BuyPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedHashRate, setSelectedHashRate] = useState<string | null>(null);
  const fadeInVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card' },
    { id: 'apple_pay', name: 'Apple Pay' },
    { id: 'google_pay', name: 'Google Pay' },
    { id: 'alipay', name: 'Alipay' },
    { id: 'wechat_pay', name: 'WeChat Pay' },
    { id: 'paypal', name: 'PayPal' },
    { id: 'klarna', name: 'Klarna' },
    { id: 'affirm', name: 'Affirm' }
  ];
  const renderGPUs = () => {
    const totalGPUs = 20; // Updated total number of GPUs to display
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

  return (
    <section>
      <motion.section className="relative h-screen bg-zinc-900/20 backdrop-blur-xl pt-40 pb-24 text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Add pointer-events-none to both background layers */}
      <div className="absolute top-0 left-0 bg-gradient-to-br 
              from-white/50 
              via-white/35 
              via-10%
              to-transparent 
              to-70%
              blur-[6rem] 
              w-96
              h-96
              pointer-events-none" />
      <div className="absolute top-0 right-1/6  bg-gradient-to-tl from-black/70 via-white/15 to-black/50 blur-[8rem] w-[70rem] h-[30rem] rounded-full origin-top-left -rotate-12 -translate-x-[15rem] pointer-events-none" />

      <div className="absolute  inset-0 opacity-10 pointer-events-none" style={{ background: "url('/noise.png') repeat" }} />

      {/* New Bitcoin logo animation */}
      {/* <motion.img
        src="pngimg.com - bitcoin_PNG27.png"
        alt="Bitcoin"
        className="absolute left-20 top-1/4 w-24 h-24 z-30 pointer-events-none"
        initial={{ y: -100, opacity: 0, rotate: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          rotate: [0, 15, -15, 0],
          transition: {
            y: { 
              type: "spring",
              bounce: 0.4,
              duration: 1.5
            },
            rotate: {
              type: "tween",
              duration: 1.2,
              ease: "easeInOut",
              times: [0, 0.25, 0.75, 1],
              repeat: Infinity,
              repeatDelay: 2
            },
            opacity: { duration: 0.8 }
          }
        }}
      /> */}

      {/* Existing content wrapper */}
      <div className="relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center px-6 lg:px-12 py-12"
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Force text color inheritance */}
          <motion.h1 className="text-4xl md:text-5xl font-bold tracking-tight font-sans bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent py-12">
            Buy Now
          </motion.h1>
          <p className="mt-2 text-lg md:text-xl text-zinc-300 leading-relaxed">
            Discover our exclusive offerings and take the next step in your Bitcoin mining journey.
          </p>
          
          {/* Fix button clickability */}
          <Link href="/contact" passHref legacyBehavior>
            <Button
              asChild
              variant="default"
              size="lg"
              className="mt-8 px-8 py-3 bg-zinc-800/50 border border-zinc-700 text-white rounded-full hover:bg-zinc-700/50 transition-all duration-300"
            >
              <a className="cursor-pointer">Get in Touch</a>
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.section>

    {/* New Section */}
    <motion.section
      className="py-14 px-6 bg-white text-black"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 relative z-5">
        {/* First Pair of Grids */}
        <div className="bg-gray-200 p-6 rounded-lg shadow-md relative z-10">
  <h3 className="text-xl font-bold mb-4">Time Plans</h3>
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
          <div className="absolute inset-0 bg-zinc-900/90 transition-all duration-500 transform -translate-x-full group-hover:translate-x-0 ease-out"></div>
        </button>
      </li>
    ))}
  </ul>
</div>
        <div className="bg-gray-200 p-6 rounded-lg shadow-md relative z-10">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-md shadow-sm text-center">
              <h3 className="text-xl font-bold">$399</h3>
              <p>ONE TIME</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm text-center">
              <h3 className="text-xl font-bold">$109</h3>
              <p>Monthly</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm text-center">
            <p>24-Hour Overwatch<br />98% Uptime Guaranteed</p>
          </div>
        </div>
      </div>
    
      {/* Second Pair of Grids */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
      <div className="bg-gray-200 p-6 rounded-lg shadow-md relative z-10">
  <h3 className="text-xl font-bold mb-4">Hash Rate</h3>
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
          <div className="absolute inset-0 bg-black/90 transition-all duration-500 transform -translate-x-full group-hover:translate-x-0 ease-out"></div>
        </button>
      </li>
    ))}
  </ul>
</div>

              {/* GPU Grid column */}
              <div className="bg-gray-200 p-6 rounded-lg shadow-md relative z-10">
                <ul className="grid grid-cols-5 gap-4">
                  {renderGPUs()}
                </ul>
              </div>
            </div>

            {/* Buttons container */}
            <div className="max-w-6xl mx-auto flex justify-between mt-12">
              {/* Checkout button */}
              <Button
                variant="default"
                size="lg"
                className="px-12 py-4 bg-zinc-800/80 border border-zinc-700 text-white rounded-full hover:bg-zinc-700/80 transition-all duration-300 text-xl"
                disabled={!selectedPlan || !selectedHashRate}
                onClick={() => {
                  if (selectedPlan && selectedHashRate) {
                    console.log(`Selected Plan: ${selectedPlan}, Selected Hash Rate: ${selectedHashRate}`);
                  }
                }}  
              >
                CheckOut
              </Button>

              {/* Our Mining Pool button */}
              <Button
                variant="default"
                size="lg"
                className="px-12 py-4 bg-zinc-800/80 border border-zinc-700 text-white rounded-full hover:bg-zinc-700/80 transition-all duration-300 text-xl"
                onClick={() => setShowMiningHosts(true)}
              >
                Our Mining Pool
              </Button>
            </div>
          </motion.section>
        ) : (
          //second section
          <motion.section
            key="miningHosts"
            layout
            layoutId="morphSection"
            className="relative py-14 px-6 text-white overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {/* Background image with dark overlay */}
            <div className="absolute inset-0 z-0">
              {/* Image background commented out
              <Image
                src="/BackgroundMap.jpg"
                alt="Mining background"
                fill
                className="object-cover object-center"
                priority
              />
              */}
              {/* Gradient background */}
                            {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-zinc/70 to-[#f5f5dc]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
            </div>
                  
            <div className="max-w-6xl mx-auto relative z-10">
              <motion.div className="bg-black p-6 rounded-lg shadow-xl border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-bold ">Our Mining Host's</h3>
                  <Button 
                    onClick={() => setShowMiningHosts(false)}
                    className="bg-zinc-800/80 border border-zinc-700 text-white rounded-full hover:bg-zinc-700/80 transition-all duration-300"
                  >
                    Back to Plans
                  </Button>
                </div>
                
                {/* Grid layout for locations */}
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: "Ethiopia", image: "/et1.jpg" },
                    { name: "Dubai", image: "/dubai.jpg" },
                    { name: "USA", image: "/usa1.jpg" },
                    { name: "Canada", image: "/canada.jpg" },
                    { name: "Iceland", image: "/iceland.jpg" },
                    { name: "Norway", image: "/norway.jpg" }
                  ].map((location, index) => (
                    <li key={index} className="relative">
                      <button
                        className="group w-full bg-white/15 p-4 rounded-md shadow-sm overflow-hidden relative transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/70"
                      >
                        <span className="relative z-10 block">
                          <div className="bg-white h-36 rounded-full relative transition-transform group-hover:scale-110 overflow-hidden">
                            <Image
                              src={location.image}
                              alt={`${location.name} mining location`}
                              fill
                              className="object-cover object-center"
                              priority
                            />
                            {/* Dark overlay on images */}
                            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/10 transition-all duration-300"></div>
                          </div>
                          <div className="mt-4 text-center">
                            <p className="text-lg font-semibold relative z-10 transition-colors duration-300 group-hover:text-white">{location.name}</p>
                            <p className="relative z-10 transition-colors duration-300 group-hover:text-white">Similar to MIM</p>
                            <p className="relative z-10 transition-colors duration-300 group-hover:text-white">0.05 c / kWh</p>
                          </div>
                        </span>
                        <div className="absolute inset-0 bg-white/60 transition-all duration-500 transform -translate-x-full group-hover:translate-x-0 ease-out"></div>
                      </button>
                    </li>
                  ))}
                </ul>         
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </section>
    
  );
};

export default BuyPage;