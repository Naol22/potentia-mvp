"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const BuyPage = () => {
  const fadeInVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section>
      <motion.section className="relative h-screen bg-zinc-900/20 backdrop-blur-xl pt-40 pb-24 text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Add pointer-events-none to both background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/60 via-zinc-900/40 to-zinc-800/80 pointer-events-none" />
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "url('/noise.png') repeat" }} />

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
              <a className="cursor-pointer">Contact Us</a>
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
          {["3 month", "4 Month", "5 Month", "6 Month"].map((plan, index) => (
            <li key={index} className="relative">
              <button className="group w-full bg-white p-4 rounded-md shadow-sm hover:scale-105 overflow-hidden relative transition-all">
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
          {["200 TH", "300 TH", "400 TH", "500 TH"].map((feature, index) => (
            <li key={index} className="relative">
              <button className="group w-full bg-white p-4 rounded-md shadow-sm overflow-hidden relative transition-all hover:scale-105">
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
          <ul className="grid grid-cols-2 gap-4">
            <li className="bg-white p-4 rounded-md shadow-sm">Feature 1</li>
            <li className="bg-white p-4 rounded-md shadow-sm">Feature 2</li>
            <li className="bg-white p-4 rounded-md shadow-sm">Feature 3</li>
            <li className="bg-white p-4 rounded-md shadow-sm">Feature 4</li>
            <li className="bg-white p-4 rounded-md shadow-sm">Feature 5</li>
            <li className="bg-white p-4 rounded-md shadow-sm">Feature 6</li>
          </ul>
        </div>
      </div>
    </motion.section>
    </section>
    
  );
};

export default BuyPage;