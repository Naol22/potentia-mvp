"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import HostingTab from "@/components/HostingTab";
import HashrateTab from "@/components/HashrateTab"; // Placeholder for future implementation
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ProductsPage = () => {
  const [activeTab, setActiveTab] = useState<"hosting" | "hashrate">("hosting");

  return (
    <section className="bg-black text-white min-h-screen font-['Inter']">
      {/* Hero Section */}
      <motion.section
        className="relative h-screen bg-black text-white flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: "url('/noise.png') repeat" }}
        />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold">Start Your Mining Journey</h1>
          <p className="mt-4 text-xl md:text-2xl text-gray-400">
            Choose the perfect Bitcoin cloud mining plan with Potentia.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/facilities">
              <Button className="mt-8 bg-white text-black hover:bg-gray-200 rounded-full px-8 py-4 text-lg">
                View Facilities
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Tab Selector */}
      <div className="bg-black py-6">
        <div className="max-w-2xl mx-auto flex justify-center space-x-6">
          <button
            className={`relative px-12 py-3 text-lg font-semibold transition-all ${
              activeTab === "hosting"
                ? "bg-white text-black shadow-sm border-4 border-black"
                : "bg-black text-gray-300 hover:bg-white text-black"
            } min-w-[200px]`}
            onClick={() => setActiveTab("hosting")}
          >
            Hosting
          </button>
          <button
            className={`relative px-12 py-3 text-lg font-semibold transition-all ${
              activeTab === "hashrate"
                ? "bg-white text-black shadow-sm border-b-4 border-white"
                : "bg-black text-gray-300 hover:bg-gray-700"
            } min-w-[200px]`}
            onClick={() => setActiveTab("hashrate")}
          >
            Hashrate Plans
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen bg-black">
        {activeTab === "hosting" ? <HostingTab /> : <HashrateTab />}
      </div>
    </section>
  );
};

export default ProductsPage;