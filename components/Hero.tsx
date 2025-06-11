"use client";

import React from "react";
import Link from "next/link";
import Head from "next/head";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <>
      <Head>
        <title>Potentia | Sustainable Bitcoin Mining</title>
        <meta
          name="description"
          content="Potentia pioneers sustainable Bitcoin mining in Africa and beyond. Join our journey to revolutionize crypto with eco-friendly solutions."
        />
        <meta
          name="keywords"
          content="sustainable Bitcoin mining, Potentia mining, eco-friendly crypto, bitcoin investment"
        />
      </Head>

      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-neutral-950">
        {/* Monochrome gradient background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center"
        >
          <div
            className="
              absolute
              w-[70rem] h-[70rem]
              bg-gradient-to-tr from-neutral-800/30 via-neutral-600/20 to-neutral-400/10
              rounded-full blur-3xl
              transform -translate-x-1/2 -translate-y-1/2
              left-1/2 top-1/2
            "
          ></div>
        </div>

        <div
          className="
            relative z-10 flex h-full flex-col items-center justify-center
            text-center text-white px-4 sm:px-6
            animate-fade-in
          "
        >
          <h1 className="mb-6 text-4xl font-bold font-sans sm:text-5xl md:text-5xl">
            Bitcoin Mining: Building Digital Transformation
          </h1>
          <p className="mb-8 max-w-2xl text-lg font-sans sm:text-xl md:text-2xl">
            Bitcoin mining investment unlocks digital asset growth, drives
            transformation, and empowers economies.
          </p>
          <div>
            <Link href="/Bitcoin_Financial_Transformation" passHref>
              <Button
                variant="ghost"
                size="lg"
                aria-label="Learn more about our services"
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;