"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

// Placeholder images for miners (replace with actual image paths)
const minerImages: { [key: string]: string } = {
  "Antminer S19Pro": "/images/antminer-s19pro.png",
  "Whatsminer M30S": "/images/whatsminer-m30s.png",
  "AvalonMiner 1246": "/images/avalonminer-1246.png",
};

const Details = () => {
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure the component is mounted on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Extract query parameters using useSearchParams
  const plan = searchParams.get("plan");
  const crypto = searchParams.get("crypto");
  const hashRate = searchParams.get("hashRate");
  const duration = searchParams.get("duration");
  const total = searchParams.get("total");
  const minerModel = searchParams.get("minerModel");
  const hashRateFee = searchParams.get("hashRateFee");
  const electricityFee = searchParams.get("electricityFee");

  // Fallback UI while the component is mounting or if query parameters are missing
  if (!isMounted) {
    return <div className="bg-black text-white min-h-screen p-8">Loading...</div>;
  }

  if (!plan || !crypto || !hashRate || !duration || !total || !minerModel) {
    return (
      <div className="bg-black text-white min-h-screen p-8">
        <h1 className="text-2xl font-bold">Error: Missing Plan Details</h1>
        <p className="mt-4">Please go back and select a plan.</p>
        <Link href="/">
          <Button className="mt-4 bg-white text-black hover:bg-black hover:text-white rounded-full py-2 px-6">
            Go Back
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back to Plans Link */}
        <div className="mb-6">
          <Link href="/">
            <Button className="bg-neutral-800 text-white hover:bg-white hover:text-black rounded-full py-2 px-6">
              Back to Plans
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side: Miner Image */}
          <div className="flex justify-center items-center">
            <Image
              src={minerImages[minerModel] || "/images/placeholder-miner.png"}
              alt={`${minerModel} Image`}
              width={400}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>

          {/* Right Side: Plan Details */}
          <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">
              {plan} - {minerModel} / {duration} Days / {crypto}-Classic Cloud Hash Rate Plan
            </h1>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span>Currency:</span>
                <span className="font-medium">{crypto}</span>
              </div>
              <div className="flex justify-between">
                <span>Hash Rate:</span>
                <span className="font-medium">{hashRate} TH/s</span>
              </div>
              <div className="flex justify-between">
                <span>Hash Rate Fee:</span>
                <span className="font-medium">${hashRateFee}</span>
              </div>
              <div className="flex justify-between">
                <span>First Payment:</span>
                <span className="font-medium">{duration} Days</span>
              </div>
              <div className="flex justify-between">
                <span>Electricity Fee:</span>
                <span className="font-medium">${electricityFee}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-2">
                <span>Total:</span>
                <span>${total}</span>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href={{
                  pathname: "/checkout",
                  query: {
                    plan,
                    crypto,
                    hashRate,
                    duration,
                    total,
                    minerModel,
                    hashRateFee,
                    electricityFee,
                  },
                }}
              >
                <Button className="w-full bg-white text-black hover:bg-black hover:text-white rounded-full py-3 text-lg font-semibold">
                  Checkout
                </Button>
              </Link>
            </div>
            <p className="text-xs mt-4 text-center">Estimated starting in 24 hrs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;