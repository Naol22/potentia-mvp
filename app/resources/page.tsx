"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ResourcesPage = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const fadeInVariants = {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
  };

  return (
    <section className="relative bg-zinc-900/20 backdrop-blur-xl pt-40 pb-24 lg:pt-48 lg:pb-32 text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/60 via-zinc-900/40 to-zinc-800/80 pointer-events-none" />
      <div className="absolute inset-0 opacity-10" style={{ background: "url('/noise.png') repeat" }} />

      <motion.div
        className="max-w-4xl mx-auto text-center px-6 lg:px-12"
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight font-sans bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
          Resources & Downloads
        </h1>
        <p className="mt-6 text-lg md:text-xl text-zinc-300 leading-relaxed">
          Dive into Potentia’s world with our curated resources—everything you need to understand our work in Bitcoin mining, HPC, and grid support.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto mt-16 space-y-8 px-6 lg:px-12">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        >
          <div className="bg-zinc-900/40 backdrop-blur-lg rounded-xl border border-zinc-800/60 hover:border-zinc-700/60 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl md:text-3xl font-semibold text-white">Resources & Downloads</h2>
            <div className="mt-6 text-zinc-300 leading-relaxed">
              <p>
                Explore Potentia’s operations, technology, and vision with our detailed resources. Whether you’re new to Bitcoin mining or a seasoned expert, these materials offer valuable insights and practical guidance.
              </p>
              <p className="mt-4">
                Download our mock white paper, user guide, and terms & agreements to get started with Potentia’s services or deepen your understanding of our innovative approach.
              </p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:gap-6">
                <a
                  href="/whitepaper.pdf"
                  download
                  className="inline-flex items-center justify-center px-4 py-2 border border-zinc-700 text-sm font-medium rounded-md text-white bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors duration-300"
                >
                  White Paper
                </a>
                <a
                  href="/guide.pdf"
                  download
                  className="inline-flex items-center justify-center px-4 py-2 border border-zinc-700 text-sm font-medium rounded-md text-white bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors duration-300"
                >
                  User Guide
                </a>
                <a
                  href="/terms.pdf"
                  download
                  className="inline-flex items-center justify-center px-4 py-2 border border-zinc-700 text-sm font-medium rounded-md text-white bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors duration-300"
                >
                  Terms & Agreements
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="max-w-4xl mx-auto mt-16 text-center px-6 lg:px-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <p className="text-xl md:text-2xl text-zinc-300 mb-8 leading-relaxed">
          Need more information or ready to join Potentia’s mission? Reach out today.
        </p>
        <Link href="/contact" passHref>
          <Button
            variant="default"
            size="lg"
            className="group relative overflow-hidden"
          >
            <span className="relative z-10">Contact Us</span>
            <span className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
};

export default ResourcesPage;