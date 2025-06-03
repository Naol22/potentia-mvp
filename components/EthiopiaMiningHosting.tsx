"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EthiopiaMiningHosting() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 },
    },
  };

  return (
    <section className="relative py-20 md:py-28 bg-black text-white overflow-hidden mt-20">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5" />
      
      {/* Animated gradient background */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-zinc-800/30 via-black to-black"
          animate={{
            opacity: [0.7, 0.5, 0.7],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-5xl mx-auto"
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Title */}
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
          >
            Ethiopia: The Premier Mining Destination
          </motion.h2>

          {/* Section 1: Low Electricity Costs */}
          <motion.div variants={fadeInUp} className="mb-10 bg-zinc-900/50 p-6 md:p-8 rounded-xl border border-zinc-800">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white">Unbeatable Electricity Costs</h3>
            <p className="text-zinc-300 leading-relaxed">
              Ethiopia offers some of the world’s lowest electricity rates, starting at just $0.045 per kWh, thanks to its abundant hydropower resources, including the Grand Ethiopian Renaissance Dam (GERD). This cost efficiency significantly reduces operational expenses, making Ethiopia a highly profitable location for cryptocurrency mining compared to regions with higher energy costs.
            </p>
          </motion.div>

          {/* Section 2: Ideal Climate */}
          <motion.div variants={fadeInUp} className="mb-10 bg-white/5 p-6 md:p-8 rounded-xl border border-zinc-800">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white">Perfect Climate for Mining</h3>
            <p className="text-zinc-300 leading-relaxed">
              With temperatures ranging from 9°C to 24°C, Ethiopia’s high-altitude regions like Addis Ababa provide a natural cooling advantage. This reduces the need for expensive cooling systems, enhancing the efficiency and longevity of mining hardware, a critical factor for maintaining profitability.
            </p>
          </motion.div>

          {/* Section 3: Government Support */}
          <motion.div variants={fadeInUp} className="mb-10 bg-gradient-to-br from-zinc-900 to-black p-6 md:p-8 rounded-xl border border-zinc-800 shadow-lg">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white">Supportive Policies and Incentives</h3>
            <p className="text-zinc-300 leading-relaxed">
              Since 2022, Ethiopia has embraced cryptocurrency mining under favorable “high-performance computing” regulations. The government offers tax holidays, duty-free imports, and land access through Power Purchase Agreements, attracting global investors. These policies create a welcoming environment for both new and experienced miners.
            </p>
            <div className="mt-8 flex justify-center md:justify-start">
              <Link href="/about">
                <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-black transition-colors group">
                  Learn More About Hosting
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Visual Element */}
          <motion.div 
            variants={fadeInUp}
            className="relative h-[200px] md:h-[300px] w-full rounded-xl overflow-hidden mt-12 border border-zinc-800 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-zinc-900 to-black z-10 opacity-70" />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-center"
              >
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">Start Your Journey Now</h3>
                <p className="text-zinc-300 max-w-md mx-auto mb-6">Join the cryptocurrency mining revolution in Ethiopia with our hosting plans</p>
                <Link href="/contact">
                  <Button variant="default" size="lg" className="bg-white text-black hover:bg-zinc-200 transition-colors group">
                    Contact Us
                    <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Button>
                </Link>
              </motion.div>
            </div>
            <Image 
              src="/mining-facility.png" 
              alt="Ethiopia Mining Revolution" 
              fill 
              className="object-cover opacity-30"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}