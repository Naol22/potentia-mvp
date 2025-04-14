"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HostingTab from "@/components/HostingTab";
import HashrateTab from "@/components/HashrateTab";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "hashrate" ? "hashrate" : "hosting";
  const [activeTab, setActiveTab] = useState<"hosting" | "hashrate">(initialTab);

  return (
    <section className="bg-black text-white min-h-screen font-['Inter'] overflow-x-hidden">
      {/* Hero Section */}
      <motion.section
        className="relative h-screen bg-black text-white flex items-center justify-center overflow-x-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div
          aria-hidden="true"
          className="flex absolute -top-96 start-1/2 transform -translate-x-1/2"
        >
          <div className="bg-gradient-to-r from-black/50 to-white/35 blur-[8rem] w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem]" />
          <div className="bg-gradient-to-tl from-black/70 to-white/35 blur-[8rem] w-[90rem] h-[50rem] rounded-full origin-top-left -rotate-12 -translate-x-[15rem]" />
        </div>

        <motion.div
          className="text-center z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Start Your Mining Journey
          </h1>
          <p className="mt-6 text-xl md:text-2xl font-light tracking-wide">
            Choose the perfect Bitcoin cloud mining plan with Potentia.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            <Link href="/facilities">
              <Button className="mt-10 border-2 border-white text-white bg-transparent hover:bg-white hover:text-black rounded-full px-8 py-3 text-lg font-medium transition-all duration-300">
                View Facilities
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Tab Selector */}
      <div className="bg-black py-12 overflow-x-hidden">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center space-x-10 bg-black border border-white/10 rounded-full px-6 py-3 shadow-lg backdrop-blur-sm">
            <button
              className={`relative px-4 py-2 text-lg font-semibold tracking-wide transition-all duration-300 ${
                activeTab === "hosting" ? "text-white" : "text-white opacity-50 hover:opacity-75 hover:scale-105 hover:tracking-wider"
              } focus:outline-none focus:ring-2 focus:ring-white rounded-full`}
              onClick={() => setActiveTab("hosting")}
            >
              Hosting
              {activeTab === "hosting" && (
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-black via-white to-black"
                  layoutId="underline"
                  initial={false}
                  transition={{ duration: 0.4, ease: "easeInOut", scale: { duration: 0.4 } }}
                  animate={{ scaleX: [1, 1.1, 1] }}
                />
              )}
            </button>
            <button
              className={`relative px-4 py-2 text-lg font-semibold tracking-wide transition-all duration-300 ${
                activeTab === "hashrate" ? "text-white" : "text-white opacity-50 hover:opacity-75 hover:scale-105 hover:tracking-wider"
              } focus:outline-none focus:ring-2 focus:ring-white rounded-full`}
              onClick={() => setActiveTab("hashrate")}
            >
              Hashrate Plans
              {activeTab === "hashrate" && (
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-black via-white to-black"
                  layoutId="underline"
                  initial={false}
                  transition={{ duration: 0.4, ease: "easeInOut", scale: { duration: 0.4 } }}
                  animate={{ scaleX: [1, 1.1, 1] }}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen bg-black overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {activeTab === "hosting" ? <HostingTab /> : <HashrateTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ProductsPage;