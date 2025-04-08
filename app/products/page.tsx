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
    <section className="bg-gradient-to-b from-gray-50 to-gray-100 text-black min-h-screen font-['Inter']">
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
          <p className="mt-4 text-xl md:text-2xl text-gray-300">
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
      <div className="flex justify-center space-x-4 py-6 border-b border-gray-200">
        <button
          className={`px-6 py-2 rounded-lg transition-all ${
            activeTab === "hosting" ? "bg-black text-white" : "bg-gray-200 text-black hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("hosting")}
        >
          Hosting
        </button>
        <button
          className={`px-6 py-2 rounded-lg transition-all ${
            activeTab === "hashrate" ? "bg-black text-white" : "bg-gray-200 text-black hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("hashrate")}
        >
          Hashrate Plans
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen">
        {activeTab === "hosting" ? <HostingTab /> : <HashrateTab />}
      </div>
    </section>
  );
};

export default ProductsPage;