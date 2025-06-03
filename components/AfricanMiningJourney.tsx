"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";


const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};


export default function AfricanMiningJourney() {
  return (
    <>
      {/* Empowering Africa Section - Now First */}
      <motion.section
        className="py-20 px-6 bg-white text-black relative overflow-hidden"
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div variants={fadeInUp} className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Empowering Africa Through Bitcoin Mining
              </h2>
              
              <p className="text-lg text-zinc-700 mb-6">
                <span className="font-medium">potentia</span> is more than a mining company it&apos;s a platform driving economic independence and digital infrastructure across Africa. By mining with <span className="font-medium">potentia</span>, global users support a movement that empowers African nations to harness local energy, attract private investment, and build long term prosperity.
              </p>
              
              <div className="space-y-6 mb-8">
                <motion.div 
                  variants={fadeInUp} 
                  className="bg-gray-50 p-5 rounded-lg border-l-4 border-black"
                >
                  <h3 className="text-xl font-semibold mb-2 text-zinc-900">Mining With Impact</h3>
                  <p className="text-zinc-700">Building Bitcoin mining facilities in Africa creating jobs, improving infrastructure, and contributing to sustainable growth.</p>
                </motion.div>
                
                <motion.div 
                  variants={fadeInUp} 
                  className="bg-gray-50 p-5 rounded-lg border-l-4 border-black"
                >
                  <h3 className="text-xl font-semibold mb-2 text-zinc-900">Post Foreign Aid Environment</h3>
                  <p className="text-zinc-700">As foreign aid declines, <span className="font-medium">potentia</span> offers a self-reliant path forward helping African countries monetize their energy generation, boost tax revenues, and build sustainability.</p>
                </motion.div>
                
                <motion.div 
                  variants={fadeInUp} 
                  className="bg-gray-50 p-5 rounded-lg border-l-4 border-black"
                >
                  <h3 className="text-xl font-semibold mb-2 text-zinc-900">From Consumers to Builders</h3>
                  <p className="text-zinc-700">Customers aren&apos;t just mining Bitcoin they&apos;re investing in Africa&apos;s role as a leader in decentralized technology.</p>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Right Image */}
            <motion.div 
              variants={fadeInUp} 
              className="relative h-[500px] order-1 md:order-2"
              whileHover="hover"
            >
                <Image
                  src="/africa-silhouette.png"
                  alt="Bitcoin Mining in Africa"
                  fill
                  className="object-contain"
                />
                {/* Africa silhouette overlay removed */}
            </motion.div>
          </div>
        </div>
      </motion.section>



      {/* The Mission Section */}
      <motion.section
        className="py-20 px-6 bg-gray-50 text-black"
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            variants={fadeInUp}
          >
            The Mission
          </motion.h2>
          
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto"
            variants={fadeInUp}
          >
            <h3 className="text-2xl font-bold mb-6 text-center">
              Empowering Global Participation in Bitcoin Mining to Drive Economic Growth and Sustainable Infrastructure
            </h3>
            
            <p className="text-lg text-zinc-700 mb-6">
              <span className="font-medium">potentia</span> is dedicated to democratizing access to Bitcoin mining removing barriers of complexity and cost, and enabling individuals, institutions, and governments to participate directly in digital asset infrastructure.
            </p>
            
            <p className="text-lg text-zinc-700">
              By connecting global investors with tangible infrastructure projects, <span className="font-medium">potentia</span> harnesses the power of Bitcoin mining not only as a pathway for financial inclusion but as a catalyst for sustainable global economic empowerment.
            </p>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}