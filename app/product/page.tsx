"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HostingTab from "@/components/HostingTab";
import HashrateTab from "@/components/HashrateTab";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useUser } from "@clerk/nextjs";

function ProductsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "hashrate" ? "hashrate" : "hosting";
  const [activeTab, setActiveTab] = useState<"hosting" | "hashrate">(
    initialTab
  );

  const { user, isLoaded } = useUser();

  useEffect(() => {
    console.log("Clerk isLoaded:", isLoaded);
    console.log("Clerk user:", user);
    if (isLoaded && user) {
      console.log("Clerk User ID:", user.id);
    } else if (isLoaded && !user) {
      console.log("Clerk: User is not signed in.");
    }
  }, [isLoaded, user]);

  return (
    <section className="bg-black text-white min-h-screen mt-[80px] font-['Inter'] overflow-x-hidden">
      {/* Tab Selector */}
      <div className="bg-black p-10 overflow-x-hidden">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center space-x-10 bg-black border border-white/10 rounded-full px-6 py-3 shadow-lg backdrop-blur-sm">
            <button
              className={`relative px-4 py-2 text-lg font-semibold tracking-wide transition-all duration-300 ${
                activeTab === "hashrate"
                  ? "text-white"
                  : "text-white opacity-50 hover:opacity-75 hover:scale-105 hover:tracking-wider"
              } `}
              onClick={() => setActiveTab("hashrate")}
            >
              Hashrate
              {activeTab === "hashrate" && (
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-black via-white to-black"
                  layoutId="underline"
                  initial={false}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                    scale: { duration: 0.4 },
                  }}
                  animate={{ scaleX: [1, 1.1, 1] }}
                />
              )}
            </button>
            <button
              className={`relative px-4 py-2 text-lg font-semibold tracking-wide transition-all duration-300 ${
                activeTab === "hosting"
                  ? "text-white"
                  : "text-white opacity-50 hover:opacity-75 hover:scale-105 hover:tracking-wider"
              }`}
              onClick={() => setActiveTab("hosting")}
            >
              Hosting
              {activeTab === "hosting" && (
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-black via-white to-black"
                  layoutId="underline"
                  initial={false}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                    scale: { duration: 0.4 },
                  }}
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
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-black text-white min-h-screen p-8">
          Loading products...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
