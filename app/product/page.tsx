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
      <motion.img
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
      />

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

        <div className="bg-gray-200 p-6 rounded-lg shadow-md relative z-10">
          <ul className="grid grid-cols-5 gap-4">
            {renderGPUs()}
          </ul>
        </div>
        
      <div className="mt-12 text-center">
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">Payment Method</h3>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {paymentMethods.map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`px-4 py-2 rounded-md text-sm transition-all ${
                  paymentMethod === method.id 
                    ? 'bg-zinc-800 text-white scale-105' 
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                {method.name}
              </button>
            ))}
          </div>
        </div>
        <Button
  variant="default"
  size="lg"
  className="px-12 py-4 bg-zinc-800/80 border border-zinc-700 text-white rounded-full hover:bg-zinc-700/80 transition-all duration-300 text-xl"
  disabled={!selectedPlan || !selectedHashRate}
  onClick={async () => {
    if (selectedPlan && selectedHashRate) {
      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: STRIPE_PRODUCTS.plans[selectedPlan as keyof typeof STRIPE_PRODUCTS.plans],
            hashRateId: STRIPE_PRODUCTS.hashRates[selectedHashRate as keyof typeof STRIPE_PRODUCTS.hashRates],
            paymentMethod: paymentMethod
          }),
        });
        
        const data = await response.json();
        
        if (!data.sessionId) {
          throw new Error('Failed to create checkout session');
        }
        
        const stripe = await stripePromise;
        
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId
          });
          
          if (error) {
            console.error('Stripe redirect error:', error);
            alert('Payment system error. Please try again later.');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        alert('There was a problem processing your request. Please try again.');
      }
    }
  }}
>
          CheckOut
        </Button>
      </div>
      </div>
    </motion.section>
    </section>
    
  );
};

export default BuyPage;