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
        <motion.div
          aria-hidden="true"
          className="flex absolute -top-96 start-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          {/* <motion.div 
            className="bg-gradient-to-r from-black/50 via-white/60 to-black/50 blur-[20rem] w-[40rem] h-[49rem] rotate-[-60deg] transform -translate-x-[10rem]"
            animate={{
              x: [0, -15, 5, -10, 0],
              y: [0, 15, -5, 10, 0],
              rotate: [-60, -65, -58, -62, -60],
              scale: [1, 1.05, 0.98, 1.02, 1]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: [0.30, 0.67, 0.83, 0.40],
              times: [0, 0.25, 0.5, 0.75, 1]
            }}
          /> */}
          {/* <motion.div 
            className="bg-gradient-to-tr from-black/70 via-white/20 to-black/50 blur-[3rem] w-[90rem] h-[80rem] rounded-full origin-bottom-right -rotate-12 -translate-x-[15rem]"
            animate={{
              x: [0, 20, -5, 10, 0],
              y: [0, -15, 5, -10, 0],
              rotate: [-20, -8, -18, -10, -18],
              opacity: [1, 0.8, 1, 0.7, 1]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          /> */}
          
          {/* Additional animated element for more dynamic feel */}
          {/* <motion.div
            className="absolute bg-gradient-to-b4 from-white/10 via-white/5 to-transparent blur-[3rem] w-[60rem] h-[30rem] rounded-full"
            initial={{ opacity: 0, x: -50, y: 100 }}
            animate={{ 
              opacity: [1, 0.6, 0.7, 0.5, 0.3],
              x: [-50, 50, -20, 40, -50],
              y: [100, 50, 150, 80, 100],
              scale: [0.8, 1.6, 0.9, 1.1, 0.8]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.2, 0.5, 0.8, 1]
            }}
          /> */}
        </motion.div>

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
