"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

// Animation variants for header and cards
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay: i * 0.2, ease: "easeOut" },
  }),
};

const MiningSolutions: React.FC = () => {
  return (
    <section className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center py-14 px-6 relative overflow-hidden">
      {/* Background Image */}
      <Image
        src="/BackgroundMap.jpg"
        alt="Mining Solutions Background"
        className="object-contain opacity-40"
        fill
        priority
      />

      {/* Black Shade Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* Main Content */}
      <motion.div
        className="w-full max-w-6xl relative z-10 flex flex-col items-center gap-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white font-sans mb-4">
            Global Mining Opportunities
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto">
            Empowering the future of bitcoin mining with cutting edge
            technology, sustainable energy, and global impact
          </p>
        </motion.div>

        {/* Centered Text Content */}
        <div className="w-full flex flex-col items-center gap-6 md:gap-8">
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-zinc-900/20 border-zinc-700/50 rounded-lg p-4 md:p-5 shadow-lg border max-w-5xl w-full backdrop-blur-sm"
          >
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
              Bitcoin Mining Excellence
            </h3>
            <p className="text-sm md:text-base text-zinc-200 leading-relaxed">
              potentia ensures top-tier performance by deploying the latest
              ASIC miners, optimizing cooling systems, and securing
              cost-effective, sustainable energy sources. potentia prioritize
              uptime, security, and operational transparency, ensuring our
              clients receive maximum mining efficiency and profitability.
              With expert management, proactive maintenance, and a commitment
              to innovation, we provide a seamless and scalable solution for
              individuals and institutions looking to mine Bitcoin with
              confidence.
            </p>
          </motion.div>

          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-zinc-900/20 border-zinc-700/50 rounded-lg p-4 md:p-5 shadow-lg border max-w-5xl w-full backdrop-blur-sm"
          >
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
              Bitcoin Mining, Hosting and Innovation
            </h3>
            <p className="text-sm md:text-base text-zinc-200 leading-relaxed">
              Our Bitcoin mining hosting service provides a seamless, secure,
              and cost-efficient solution for individuals and institutions
              looking to gain Bitcoin exposure without the complexities of
              running their own mining operations. With a global footprint and
              strong international partnerships, we offer state-of-the-art
              facilities powered by sustainable energy sources, ensuring
              optimal performance and profitability. Our strategically located
              data centers benefit from competitive electricity rates and
              government-friendly regulations, maximizing returns for our
              clients. Whether you’re an investor, miner, or institution, our
              turnkey hosting packages provide a hassle-free way to
              participate in Bitcoin mining while supporting economic growth
              in emerging markets
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default MiningSolutions;