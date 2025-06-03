"use client";

import React from "react";
import { motion } from "framer-motion";

const SolutionsByProduct: React.FC = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const arrowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  // Solution data
  const solutions = [
    {
      problem: {
        icon: "/icons/hand-stop.svg", // You'll need to create or add these icons
        title: "Limited Accessibility to Bitcoin Mining",
        description: "Traditional mining requires high upfront investment, technical skills, and ongoing maintenance barriers that exclude most individuals",
      },
      solution: {
        icon: "/icons/cycle.svg",
        title: "Hashrate Subscriptions",
        description: "<span class=\"font-normal\">potentia</span> offers affordable, hardware free monthly subscriptions that allow anyone to mine Bitcoin and receive daily payouts. The beginning of the Mining Journey",
      },
    },
    {
      problem: {
        icon: "/icons/energy.svg",
        title: "Underutilized Renewable Energy in Emerging Markets",
        description: "Countries like Ethiopia have abundant clean energy but lack infrastructure and investment channels to put it to use",
      },
      solution: {
        icon: "/icons/power.svg",
        title: "Hosting Services in Renewable Powered Facilities",
        description: "<span class=\"font-normal\">potentia</span> builds and operates mining infrastructure in energy rich regions, turning excess energy into productive digital assets",
      },
    },
    {
      problem: {
        icon: "/icons/broken-link.svg",
        title: "Disconnected Economic Incentives for Impact Driven Investment",
        description: "Investors lack direct ways to support infrastructure growth or social impact through crypto-based tools",
      },
      solution: {
        icon: "/icons/document.svg",
        title: "Strategic Consulting for Governments & Institutions",
        description: "Consulting engagements include government policy design, regulatory frameworks, infrastructure integration, energy resource management, and diplomatic partnerships under our Bitcoin Diplomacy initiative",
      },
    },
  ];

  return (
    <section className="relative w-full py-20 bg-black text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z\"%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Solutions by Product Offerings</h2>
          <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Addressing key market challenges with innovative Bitcoin mining solutions
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <motion.div
          className="space-y-12 md:space-y-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {solutions.map((item, index) => (
            <motion.div 
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-11 gap-4 md:gap-8 items-center"
              variants={itemVariants}
            >
              {/* Problem Column */}
              <div className="lg:col-span-5 bg-zinc-900 p-6 md:p-8 rounded-lg border border-zinc-800">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-red-500 bg-red-900/20 px-2 py-1 rounded-full">Problem</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center border border-red-800/30">
                      {/* Replace with actual icon */}
                      <div className="w-8 h-8 text-red-500">
                        {index === 0 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
                        ) : index === 1 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-500 mb-2">{item.problem.title}</h3>
                      <p className="text-gray-300">{item.problem.description}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Arrow Column */}
              <motion.div 
                className="lg:col-span-1 flex justify-center"
                variants={arrowVariants}
              >
                <div className="hidden md:block w-12 h-12 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
                <div className="md:hidden w-12 h-12 text-gray-500 transform rotate-90">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
              </motion.div>
              
              {/* Solution Column */}
              <div className="lg:col-span-5 bg-zinc-900 p-6 md:p-8 rounded-lg border border-zinc-800">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-green-500 bg-green-900/20 px-2 py-1 rounded-full">Solution</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-900/20 flex items-center justify-center border border-green-800/30">
                      {/* Replace with actual icon */}
                      <div className="w-8 h-8 text-green-500">
                        {index === 0 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="10" />
                            <path d="M9 8h6" />
                            <path d="M9 12h6" />
                            <path d="M9 16h6" />
                            <path d="M12 6v12" />
                            <path d="M8 12h8" />
                          </svg>
                        ) : index === 1 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3"/><path d="M9 20h6"/><path d="M12 4v16"/><path d="M10 20H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-500 mb-2">{item.solution.title}</h3>
                      <p className="text-gray-300" dangerouslySetInnerHTML={{ __html: item.solution.description }}></p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Potentia Logo Watermark */}
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          {/* <Image 
            src="/Artboardw.png" 
            alt="potentia watermark" 
            width={300} 
            height={300} 
            className="object-contain"
          /> */}
        </div>
      </div>
    </section>
  );
};

export default SolutionsByProduct;