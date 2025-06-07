"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const pathVariant = {
  hidden: { pathLength: 0 },
  visible: { 
    pathLength: 1,
    transition: { 
      duration: 1.5, 
      ease: "easeInOut",
      delay: 0.3 
    } 
  }
};

export default function MiningJourneyModel() {
  return (
    <motion.section
      className="py-20 px-6 bg-black text-white relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Africa-shaped background image */}
      <motion.div 
        className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2/5 h-4/5 opacity-25 z-0"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <Image
          src="/Aoutline.png" 
          alt="Africa Silhouette"
          fill
          className="object-contain"
        />
      </motion.div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-white tracking-tight"
          variants={fadeInUp}
        >
          The Mining Journey Model
        </motion.h1>

        <motion.div 
          className="text-center mb-12 max-w-3xl mx-auto"
          variants={fadeInUp}
        >
          <p className="text-xl text-white mb-4">
            <span className="font-semibold">Customer Lifecycle: From Civilian to Miner</span>
          </p>
          <p className="text-lg text-white">
            <span className="font-medium">potentia</span> unique, customer centric approach guides individuals step-by-step into full-scale Bitcoin mining.
          </p>
        </motion.div>

        {/* Desktop View - Horizontal Layout with Connected Cards */}
        <div className="hidden md:block relative mb-16">
          <div className="flex justify-between items-center relative max-w-5xl mx-auto">
            {/* First Card */}
            <motion.div
              variants={fadeIn}
              className="w-[350px] bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center transition-all hover:shadow-2xl hover:border-gray-300 z-10"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center shadow-xl mx-auto mb-6"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">
                Build Now
              </h2>
              <h3 className="text-xl font-semibold text-zinc-800 mb-3">
                Monthly Hashrate Subscriptions
              </h3>
              <p className="text-zinc-700 text-lg leading-relaxed">
                Instantly access mining power earn daily Bitcoin rewards without technical expertise or upfront costs.
              </p>
            </motion.div>
            
            {/* SVG Path Connection - Horizontal with increased height for more curve */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 z-0">
              <svg width="100%" height="180" viewBox="0 0 800 180" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <motion.path 
                  d="M 0,90 C 200,90 200,10 400,10 C 600,10 600,170 800,90" 
                  stroke="white" 
                  strokeWidth="2"
                  fill="transparent"
                  variants={pathVariant}
                />
                {/* Dots at start and end */}
                <motion.circle cx="0" cy="90" r="5" fill="black" 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                />
                <motion.circle cx="800" cy="90" r="5" fill="black" 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.5 }}
                />
              </svg>
            </div>
            
            {/* Second Card */}
            <motion.div
              variants={fadeIn}
              className="w-[350px] bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center transition-all hover:shadow-2xl hover:border-gray-300 z-10"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center shadow-xl mx-auto mb-6"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/></svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">
                Scale Your Impact
              </h2>
              <h3 className="text-xl font-semibold text-zinc-800 mb-3">
                Transition to Hosted Equipment
              </h3>
              <p className="text-zinc-700 text-lg leading-relaxed">
                Grow confidently into owning mining equipment we handle all operations, security, and infrastructure at renewable powered facilities.
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Mobile View - Vertical Layout with Connected Cards */}
        <div className="md:hidden relative mb-12">
          <div className="flex flex-col items-center relative">
            {/* First Card */}
            <motion.div
              variants={fadeIn}
              className="w-full max-w-[320px] bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center transition-all hover:shadow-2xl hover:border-gray-300 z-10 mb-36"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center shadow-xl mx-auto mb-6"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </motion.div>
              <h2 className="text-xl font-bold text-zinc-900 mb-3">
                Build Now
              </h2>
              <h3 className="text-lg font-semibold text-zinc-800 mb-2">
                Monthly Hashrate Subscriptions
              </h3>
              <p className="text-zinc-700 text-sm leading-relaxed">
                Instantly access mining power earn daily Bitcoin rewards without technical expertise or upfront costs.
              </p>
            </motion.div>
            
            {/* SVG Path Connection - Vertical with increased width for more curve */}
            <div className="absolute top-[220px] left-1/2 h-[300px] w-[2px] -translate-x-1/2 z-0">
              <svg width="140" height="300" viewBox="0 0 140 480" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <motion.path 
                  d="M 70,0 C 70,120 10,120 10,240 C 10,360 130,360 70,480" 
                  stroke="white" 
                  strokeWidth="2"
                  fill="transparent"
                  variants={pathVariant}
                />
                {/* Dots at start and end */}
                <motion.circle cx="70" cy="0" r="5" fill="black" 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                />
                <motion.circle cx="70" cy="480" r="5" fill="black" 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.5 }}
                />
              </svg>
            </div>
            
            {/* Second Card */}
            <motion.div
              variants={fadeIn}
              className="w-full max-w-[320px] bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center transition-all hover:shadow-2xl hover:border-gray-300 z-10 "
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center shadow-xl mx-auto mb-6"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/></svg>
              </motion.div>
              <h2 className="text-xl font-bold text-zinc-900 mb-3">
                Scale Your Impact
              </h2>
              <h3 className="text-lg font-semibold text-zinc-800 mb-2">
                Transition to Hosted Equipment
              </h3>
              <p className="text-zinc-700 text-sm leading-relaxed">
                Grow confidently into owning mining equipment we handle all operations, security, and infrastructure at renewable powered facilities.
              </p>
            </motion.div>
          </div>
        </div>

     <motion.div 
  className="text-center max-w-3xl mx-auto"
  variants={fadeInUp}
>
  <p className="text-lg text-white italic">
    From novice to experienced miner, <span className="font-medium">potentia</span> empowers every customer on their Bitcoin Mining Journey.
  </p>

  {/* Start Now Button */}
  <motion.a
    href="/product"
    className="inline-block mt-10 px-20 py-5 bg-white text-black font-semibold rounded-lg shadow-md hover:bg-gray-200 transition duration-300"
    whileHover={{ scale: 1.20 }}
    whileTap={{ scale: 0.95 }}
  >
    Start Now
  </motion.a>
</motion.div>
      </div>
    </motion.section>
  );
}