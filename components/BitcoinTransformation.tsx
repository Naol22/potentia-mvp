"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BitcoinTransformation() {
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
      <div className="absolute inset-0 opacity-5"  />
      
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
            The Financial System Transformation
          </motion.h2>

          {/* Section 1: Global Financial System */}
          <motion.div variants={fadeInUp} className="mb-10 bg-zinc-900/50 p-6 md:p-8 rounded-xl border border-zinc-800">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white">Global Financial Transformation</h3>
            <p className="text-zinc-300 leading-relaxed">
              The global financial system is entering a period of accelerated transformation, with Bitcoin positioned at the forefront of this shift. As traditional markets face growing instability from inflation and monetary policy shifts to geopolitical uncertainty Bitcoin has increasingly gained recognition as a resilient, decentralized store of value. The United States recent move toward establishing a strategic Bitcoin reserve marks a historic milestone in this transition. By formalizing Bitcoin as a national strategic asset, the U.S. is validating the role of Bitcoin not just as an investment vehicle, but as a foundational element of economic resilience and sovereignty.
            </p>
          </motion.div>

          {/* Section 2: Market Effects */}
          <motion.div variants={fadeInUp} className="mb-10 bg-white/5 p-6 md:p-8 rounded-xl border border-zinc-800">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white">Global Market Effects</h3>
            <p className="text-zinc-300 leading-relaxed">
              This signal from the world&apos;s largest economy is having a ripple effect across global markets. Nation-states, multinational corporations, and financial institutions are reassessing their positions, recognizing Bitcoin&apos;s potential to enhance GDP, stabilize reserves, and serve as a hedge against fiat currency devaluation. Simultaneously, the general public particularly in the United States is increasingly viewing Bitcoin not as a speculative instrument, but as a safe harbor in times of economic uncertainty.
            </p>
          </motion.div>

          {/* Section 3: Potentia's Position */}
          <motion.div variants={fadeInUp} className="mb-10 bg-gradient-to-br from-zinc-900 to-black p-6 md:p-8 rounded-xl border border-zinc-800 shadow-lg">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white">potentia&apos;s Unique Position</h3>
            <p className="text-zinc-300 leading-relaxed">
              potentia is uniquely positioned to harness this momentum. Our platform offers a scalable, low barrier entry into Bitcoin mining through hash rate subscriptions and self-hosted mining options targeting both experienced Bitcoin holders and a new class of consumers seeking purpose driven digital asset exposure. What differentiates potentia is not only our infrastructure or consulting practice, but our mission aligned marketing approach: we connect consumers to African infrastructure development through Bitcoin mining.
            </p>
            
            <div className="mt-8 flex justify-center md:justify-start">
              <Link href="/about">
                <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-black transition-colors group">
                  Learn More About us
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
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">Join The Movement</h3>
                <p className="text-zinc-300 max-w-md mx-auto mb-6">Be part of the financial transformation through Bitcoin mining with potentia</p>
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
              src="/bitcoin-pickaxe.png" 
              alt="Bitcoin Mining Revolution" 
              fill 
              className="object-cover opacity-30"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}