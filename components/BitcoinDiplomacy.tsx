"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function BitcoinDiplomacy() {
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
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 bg-gray-50 text-black overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5" />

      {/* Content Container */}
      <motion.div
        className="max-w-6xl w-full relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12"
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Left Side: Text and Title */}
        <motion.div variants={fadeInUp} className="flex flex-col items-start text-left space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-black font-sans bg-clip-text">
            Consulting Services & Bitcoin Diplomacy
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-700 leading-relaxed max-w-lg">
            potentia offers strategic consulting services designed for governments, institutions, and energy rich emerging markets seeking to integrate Bitcoin mining into their national development strategies.
          </p>
          
          <div className="mt-6 space-y-6">
            <motion.div variants={fadeInUp} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-2xl font-bold text-black mb-3">Bitcoin Diplomacy Framework</h3>
              <p className="text-zinc-700">
                Through its proprietary framework called Bitcoin Diplomacy, potentia positions Bitcoin not just as a financial asset, but as a tool for sovereign economic growth, energy monetization, and international cooperation.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-2xl font-bold text-black mb-3">Post-Aid World</h3>
              <p className="text-zinc-700">
                As more nations seek to assert independence in a post-aid world, Bitcoin Diplomacy creates a unique opportunity for countries to form alliances based on shared Bitcoin policy strategies enabling them to shape global policy, protect the decentralized network, and use mining as a diplomatic and economic bridge.
              </p>
            </motion.div>
          </div>
          
          <motion.div
            variants={fadeInUp}
            className="mt-8"
          >
            <Link href="/Productsdescription">
              <Button variant="default" size="lg" className="bg-white group">
                Learn About Our Services
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Side: Bitcoin Pickaxe Image with Africa Overlay */}
        <motion.div
          variants={fadeInUp}
          className="relative flex justify-center items-center "
        >
          <div 
            className="relative w-full h-[320px] rounded-2xl overflow-hidden shadow-xl"
          >
            <Image
              src="/bitcoin-pickaxe.png"
              alt="Bitcoin Mining in Africa"
              fill
              className="object-contain"
              style={{ objectPosition: 'center' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}