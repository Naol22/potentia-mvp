"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function DetailsPage() {
  const searchParams = useSearchParams();
  const hashrate = Number(searchParams.get("hashrate")) || 100;
  const model = searchParams.get("model") || "antminer-s21";
  const price = Number(searchParams.get("price")) || 5;
  const machines = Number(searchParams.get("machines")) || 1;

  const estimatedOutput = (hashrate * 0.0005).toFixed(4);

  return (
    <div className="bg-black text-white py-8 px-4 overflow-x-hidden font-['Inter']">
      {/* Hero Section */}
      <motion.section
        className="relative h-96 bg-neutral-800 rounded-xl overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Image
          src="/antminer-s21.jpg"
          alt="Antminer S21"
          fill
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Mining Plan: {hashrate} TH/s
          </h1>
          <p className="text-lg md:text-xl max-w-2xl">
            Powered by Antminer S21 for optimal performance
          </p>
        </div>
      </motion.section>

      {/* Details Section */}
      <motion.div
        className="max-w-4xl mx-auto mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <div className="bg-neutral-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Plan Summary</h2>
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium">Hashrate:</span> {hashrate} TH/s
              </p>
              <p>
                <span className="font-medium">Miner Model:</span> Antminer S21
              </p>
              <p>
                <span className="font-medium">Plan Duration:</span> Monthly Recurring
              </p>
              <p>
                <span className="font-medium">Price:</span> ${price}/month
              </p>
              <p>
                <span className="font-medium">Estimated Output:</span> ~{estimatedOutput} BTC/month
              </p>
              <p>
                <span className="font-medium">Active Machines:</span> {machines}
              </p>
            </div>
            <div className="mt-6">
              <Link href="/checkout">
                <Button className="w-full bg-white text-black hover:bg-black hover:text-white rounded-full py-3 text-lg font-medium transition-all">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>

          {/* Miner Details */}
          <div className="bg-neutral-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Antminer S21 Specifications</h2>
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium">Model:</span> Antminer S21
              </p>
              <p>
                <span className="font-medium">Hashrate:</span> Up to 200 TH/s per unit
              </p>
              <p>
                <span className="font-medium">Power Efficiency:</span> 17.5 J/TH
              </p>
              <p>
                <span className="font-medium">Power Consumption:</span> ~3500W
              </p>
              <p>
                <span className="font-medium">Cooling:</span> Advanced air-cooling system
              </p>
              <p>
                <span className="font-medium">Uptime:</span> 99.9% guaranteed
              </p>
              <p>
                <span className="font-medium">Features:</span> Real-time monitoring, daily payouts
              </p>
            </div>
            <div className="mt-6">
              <Image
                src="/antminer-s21-detail.jpg"
                alt="Antminer S21 Detail"
                width={300}
                height={200}
                className="w-full rounded-lg object-cover"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-neutral-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Why Choose This Plan?</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Scalable hashrate from 100 TH/s to 3000 TH/s to suit your needs.</li>
            <li>Powered by Antminer S21, one of the most efficient miners available.</li>
            <li>Hosted in top-tier facilities with renewable energy sources.</li>
            <li>Transparent pricing at ${price}/month for {hashrate} TH/s.</li>
            <li>Estimated monthly output of ~{estimatedOutput} BTC based on current network conditions.</li>
            <li>24/7 support and real-time performance tracking.</li>
          </ul>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-neutral-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">What is cloud mining?</h3>
              <p className="text-sm">
                Cloud mining allows you to rent hashrate from remote data centers, eliminating the need to own or maintain hardware.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">How are payouts calculated?</h3>
              <p className="text-sm">
                Payouts are based on your hashrate and current network difficulty, paid daily in Bitcoin.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Can I upgrade my plan?</h3>
              <p className="text-sm">
                Yes, you can adjust your hashrate at any time to scale your mining output.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}