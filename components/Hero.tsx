"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Head from "next/head";

const Hero = () => {
  const overlayVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  return (
    <>
      <Head>
        {" "}
        <title>Potentia | Sustainable Bitcoin Mining Startup</title>
        <meta
          name="description"
          content="Potentia pioneers sustainable Bitcoin mining in Africa and beyond. Join our journey to revolutionize crypto with eco-friendly solutions."
        />
        <meta
          name="keywords"
          content="sustainable Bitcoin mining, Potentia mining, eco-friendly crypto"
        />
      </Head>

      <section className="relative h-screen w-full overflow-hidden pt-40">
        {/* Custom Gradient Background */}
        <div
          aria-hidden="true"
          className="flex absolute -top-96 start-1/2 transform -translate-x-1/2"
        >
          <div className="bg-gradient-to-r from-black/50 via-white/60 to-black/70 blur-[8rem] w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem]" />
          <div className="bg-gradient-to-tl from-black/70 via-white/15 to-black/50 blur-[8rem] w-[90rem] h-[50rem] rounded-full origin-top-left -rotate-12 -translate-x-[15rem]" />
        </div>

        {/* Overlay Content with Animation */}
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4 sm:px-6"
        >
          <h1 className="mb-6 text-4xl font-bold font-sans sm:text-5xl md:text-5xl">
            Bitcoin Mining: Building Digital Transformation
          </h1>
          <p className="mb-8 max-w-2xl text-lg font-sans sm:text-xl md:text-2xl">
            Bitcoin mining investment unlocks digital asset growth, drives
            transformation, and empowers economies.
          </p>
          <div>
            <Link href="" passHref>
              <Button
                variant="ghost"
                size="lg"
                aria-label="Get Started with our services"
                className="group"
              >
                Learn more
                <svg
                  className="ml-2 h-5 w-5 inline-block transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" d="M9 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Hero;
