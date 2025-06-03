"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const Learn = () => {
  const [openSection, setOpenSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const fadeInVariants = {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
  };

  return (
    <section className="relative bg-zinc-900/20 backdrop-blur-xl pt-40 pb-24 lg:pt-48 lg:pb-32 text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/60 via-zinc-900/40 to-zinc-800/80 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-10"
        
      />

      <motion.div
        className="max-w-4xl mx-auto text-center px-6 lg:px-12"
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight font-sans bg-gradient-to-r from-white to-zinc-100 bg-clip-text">
          Master Bitcoin Mining
        </h1>
        <p className="mt-6 text-lg md:text-xl text-zinc-300 leading-relaxed">
          Unlock the secrets of Bitcoin mining explore the tech, economics, and
          energy driving the future of decentralized finance with
          <span className="font-normal"> potentia</span>&apos;s expertise.
        </p>
      </motion.div>

      {/* Accordion Sections */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8 px-6 lg:px-12">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        >
          <div
            className="bg-zinc-900/40 backdrop-blur-lg rounded-xl border border-zinc-800/60 hover:border-zinc-700/60 cursor-pointer p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => toggleSection(1)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                What is Bitcoin Mining?
              </h2>
              <motion.span
                className="text-zinc-400 text-2xl"
                animate={{ rotate: openSection === 1 ? 45 : 0 }}
                transition={{ duration: 0.3 }}
              >
                +
              </motion.span>
            </div>
            <AnimatePresence>
              {openSection === 1 && (
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="mt-6 text-zinc-300 leading-relaxed"
                >
                  <p>
                    Bitcoin mining is the decentralized process by which new Bitcoin is issued, transactions are verified, and the Bitcoin network is secured. It is a foundational mechanism that supports the integrity and continuity of the Bitcoin blockchain, a public, cryptographically secured ledger that records all Bitcoin transactions.
                  </p>
                  <h3 className="text-xl font-semibold mt-6 mb-3">Core Functions of Bitcoin Mining</h3>
                  <h4 className="text-lg font-medium mt-4 mb-2">Transaction Validation:</h4>
                  <p>
                    Bitcoin transactions are not automatically added to the blockchain. They must first be verified to ensure the sender has sufficient funds and the transaction is properly formatted.
                  </p>
                  <p className="mt-2">
                    Miners collect these pending transactions into a structure called a block, which they then attempt to validate through mining.
                  </p>
                  <h4 className="text-lg font-medium mt-4 mb-2">Proof of Work (PoW):</h4>
                  <p>
                    To add a new block to the blockchain, miners must compete to solve a cryptographic puzzle. This requires substantial computational effort and energy.
                  </p>
                  <p className="mt-2">
                    The first miner to solve the puzzle broadcasts the solution, and once the majority of the network agrees that the solution is valid, the new block is added to the blockchain.
                  </p>
                  <p className="mt-2">
                    This process is called Proof of Work a consensus mechanism that ensures the network&apos;s trustless, decentralized nature.
                  </p>
                  <a
                    href="https://academy.binance.com/en/articles/how-to-mine-cryptocurrency?utm_campaign=googleadsxacademy&utm_source=googleadwords_int&utm_medium=cpc&ref=WMNC7PBZ&gad_source=1&gclid=CjwKCAiAlPu9BhAjEiwA5NDSA6rvWgZyVBcfWo-YyhIhr_t0A1y-ML34RY-On9r1QhrJ_OxywZ7HKBoCr1kQAvD_BwE"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                  <Button
                    variant="outline"
                    className="mt-4 bg-white text-black"
                    size="sm"
                  >
                    Explore More
                  </Button>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        >
          <div
            className="bg-zinc-900/40 backdrop-blur-lg rounded-xl border border-zinc-800/60 hover:border-zinc-700/60 cursor-pointer p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => toggleSection(2)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                Incentive Structure & Network Security
              </h2>
              <motion.span
                className="text-zinc-400 text-2xl"
                animate={{ rotate: openSection === 2 ? 45 : 0 }}
                transition={{ duration: 0.3 }}
              >
                +
              </motion.span>
            </div>
            <AnimatePresence>
              {openSection === 2 && (
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="mt-6 text-zinc-300 leading-relaxed"
                >
                  <h4 className="text-lg font-medium mb-2">Incentive Structure:</h4>
                  <p>Miners are rewarded with two incentives:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      <strong>Block reward:</strong> A fixed number of newly created bitcoins.
                    </li>
                    <li>
                      <strong>Transaction fees:</strong> Paid by users to prioritize their transactions.
                    </li>
                  </ul>
                  <p className="mt-2">
                    The block reward halves approximately every four years in an event called the Bitcoin halving, which gradually reduces Bitcoin&apos;s inflation rate and reinforces its scarcity.
                  </p>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">Network Security:</h4>
                  <p>
                    Mining ensures the network is resistant to attacks such as double-spending or fraudulent transactions.
                  </p>
                  <p className="mt-2">
                    To manipulate the blockchain, an attacker would need to control more than 50% of the total network hash rate, a prohibitively expensive and logistically difficult feat due to the immense computational power required.
                  </p>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">Technical Infrastructure:</h4>
                  <p>
                    Bitcoin mining requires specialized hardware known as Application Specific Integrated Circuits (ASICs), which are optimized for the SHA-256 algorithm used in Bitcoin&apos;s Proof of Work.
                  </p>
                  <p className="mt-2">Key infrastructure considerations:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      <strong>Energy source:</strong> Mining is energy-intensive, leading to geographic clustering in regions with abundant, cheap, or renewable energy.
                    </li>
                    <li>
                      <strong>Cooling and ventilation:</strong> ASICs generate significant heat, necessitating industrial scale cooling systems.
                    </li>
                    <li>
                      <strong>Connectivity:</strong> High speed internet is essential for synchronization with the global Bitcoin network.
                    </li>
                  </ul>
                  <a
                    href="https://academy.binance.com/en/articles/how-to-mine-cryptocurrency?utm_campaign=googleadsxacademy&utm_source=googleadwords_int&utm_medium=cpc&ref=WMNC7PBZ&gad_source=1&gclid=CjwKCAiAlPu9BhAjEiwA5NDSA6rvWgZyVBcfWo-YyhIhr_t0A1y-ML34RY-On9r1QhrJ_OxywZ7HKBoCr1kQAvD_BwE"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="mt-4 bg-white text-black"
                      size="sm"
                    >
                      Dive Deeper
                    </Button>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        >
          <div
            className="bg-zinc-900/40 backdrop-blur-lg rounded-xl border border-zinc-800/60 hover:border-zinc-700/60 cursor-pointer p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => toggleSection(3)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                Economic & Strategic Significance
              </h2>
              <motion.span
                className="text-zinc-400 text-2xl"
                animate={{ rotate: openSection === 3 ? 45 : 0 }}
                transition={{ duration: 0.3 }}
              >
                +
              </motion.span>
            </div>
            <AnimatePresence>
              {openSection === 3 && (
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="mt-6 text-zinc-300 leading-relaxed"
                >
                  <p>
                    Bitcoin mining extends far beyond technical operations, offering significant economic and strategic advantages:
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-3">
                    <li>
                      <strong>Digital Commodity Production:</strong> Bitcoin mining is the process of &quot;producing&quot; a digitally scarce commodity Bitcoin. Unlike fiat currencies, Bitcoin&apos;s issuance is algorithmically fixed and transparent.
                    </li>
                    <li>
                      <strong>Geopolitical Tool:</strong> Countries with low cost electricity and favorable regulations can become major players in the global Bitcoin mining landscape, influencing the decentralized network and attracting foreign direct investment.
                    </li>
                    <li>
                      <strong>Financial Inclusion & Infrastructure Development:</strong> For underdeveloped regions, mining can become a gateway to infrastructure investment (e.g., renewable energy projects) and financial sovereignty.
                    </li>
                  </ul>
                  <h4 className="text-lg font-medium mt-4 mb-2">Conclusion:</h4>
                  <p>
                    Bitcoin mining is far more than a technical process it is the backbone of the Bitcoin monetary network. It blends economics, cryptography, computer science, and energy policy into a single global system. As Bitcoin matures, mining is increasingly viewed not just as a business opportunity, but as a national strategic asset that can influence energy policy, economic development, and international diplomacy.
                  </p>
                  <p className="mt-4">
                    At <span className="font-normal">potentia</span>, we&apos;re building infrastructure that leverages these strategic advantages while promoting sustainable practices.
                  </p>
                  <a
                    href="https://academy.binance.com/en/articles/how-to-mine-cryptocurrency?utm_campaign=googleadsxacademy&utm_source=googleadwords_int&utm_medium=cpc&ref=WMNC7PBZ&gad_source=1&gclid=CjwKCAiAlPu9BhAjEiwA5NDSA6rvWgZyVBcfWo-YyhIhr_t0A1y-ML34RY-On9r1QhrJ_OxywZ7HKBoCr1kQAvD_BwE"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="mt-4 bg-white text-black"
                      size="sm"
                    >
                      Learn More
                    </Button>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
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
        {/* Uncomment if you want to restore this section */}
        {/* <p className="text-xl md:text-2xl text-zinc-300 mb-8 leading-relaxed">
          Ready to harness Bitcoin mining's power with Potentia's
          cutting-edge solutions?
        </p>
        <Button
          variant="default"
          size="lg"
          className="group relative overflow-hidden bg-white text-black"
        >
          <span className="relative z-10">Get Started `{"->"}` </span>
          <span className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button> */}
      </motion.div>
    </section>
  );
};

export default Learn;