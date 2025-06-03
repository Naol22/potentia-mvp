"use client";
import React from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import SolutionsByProduct from "@/components/SolutionsByProduct";
import {
  Bitcoin,
  HandCoins,
  Handshake,
  BatteryCharging,
  BookOpen,
  Blocks,
  Cpu,
  Shrub,
} from "lucide-react";
import Team from "@/components/Team";
import { Button } from "@/components/ui/button"; 
import Link from "next/link";



const features = [
  {
    title: "Bitcoin Mining Excellence",
    description:
      "We deliver top-tier performance with cutting-edge ASIC miners, optimized infrastructure, and cost-effective renewable energy solutions.",
    icon: Bitcoin,
  },
  {
    title: "Economic Empowerment",
    description:
      "potentia fosters financial inclusion by making Bitcoin mining accessible, unlocking economic opportunities in emerging markets.",
    icon: HandCoins,
  },
  {
    title: "Global Partnerships",
    description:
      "Our worldwide network shapes innovative mining policies and delivers exceptional value to investors and communities alike.",
    icon: Handshake,
  },
  {
    title: "Sustainable Mining",
    description:
      "Harnessing renewable energy and efficient practices, we&apos;re building a greener future for Bitcoin mining.",
    icon: BatteryCharging,
  },
  {
    title: "Thought Leadership",
    description:
      "We educate and inspire with insights on Bitcoin mining, blockchain, and digital finance opportunities.",
    icon: BookOpen,
  },
  {
    title: "Seamless Hosting",
    description:
      "From setup to maintenance, we provide secure, efficient mining solutions with maximum uptime.",
    icon: Blocks,
  },
  {
    title: "Digital Transformation",
    description:
      "Bridging traditional finance and decentralized assets, we accelerate blockchain adoption globally.",
    icon: Cpu,
  },
  {
    title: "Financial Sovereignty",
    description:
      "We empower investors and miners with secure Bitcoin exposure, driving wealth and independence.",
    icon: Shrub,
  },
];

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

const About = () => {
  return (
    <div className="bg-zinc-500 text-white overflow-hidden mt-[210px]">
      {/* Head for SEO */}
      <Head>
        <title>About potentia | Sustainable Bitcoin Mining in Africa</title>
        <meta
          name="description"
          content="Learn about potentia, a startup revolutionizing Bitcoin mining with sustainable solutions in Africa and beyond. Discover our mission, vision, and impact."
        />
        <meta
          name="keywords"
          content="Bitcoin mining Africa, sustainable mining, potentia startup, eco-friendly crypto, VOA interview"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://potentia-web.vercel.app/about" />
      </Head>

      {/* Mission & Vision */}
      <motion.section
        className="py-20 px-6 bg-black"
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div variants={fadeInUp}>
            <h2
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
              id="mission"
            >
              Our Mission
            </h2>
            <p className="text-zinc-300 text-lg leading-relaxed text-justify">
             potentia&apos;s mission is to make Bitcoin mining accessible, impactful, and inclusive by offering, 
            subscription-based mining services, environmentally responsible and renewable powered hosting infrastructure, and strategic
             consulting that empowers individuals, institutions, and governments to efficiently transform surplus energy 
             into sustainable economic opportunity through the power of decentralized finance.
              </p>
              <p className="text-zinc-300 text-lg leading-relaxed mt-5 text-justify">
               
              By connecting global consumers to mining operations in Africa, we create a model
                where individual participation drives collective progress. This enables African
                nations to build sustainable digital economies, reducing foreign aid dependence
                while fostering economic resilience through decentralized finance.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Our Vision
            </h2>
            <p className="text-zinc-300 text-lg leading-relaxed text-justify">
            potentia envisions a world where access to economic sovereignty, digital infrastructure,
             and energy monetization is no longer limited by geography or capital. Our vision is to
              democratize Bitcoin mining by transforming it into a tool for global inclusion, allowing individuals,
               institutions, and governments especially across Africa to harness the power of decentralized finance 
               to build resilient, self-directed economies. 
               </p>
               <p className="text-zinc-300 text-lg leading-relaxed mt-5 text-justify">
               Through our unique blend of mining access, renewable energy 
               infrastructure, and strategic consulting, potentia aims to lead a new wave of digital empowerment one where
                Bitcoin becomes a bridge between capital and impact, innovation and equity, and between the Global South and 
                the future of finance.
            </p>
          </motion.div>
        </div>
      </motion.section>
     <SolutionsByProduct/>
      <Team /> 

      {/* Features Showcase */}
      <motion.section
        className="py-32 px-6 bg-zinc-900"
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-12 text-white"
            variants={fadeInUp}
          >
            What Sets Us Apart
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-zinc-800 to-black p-6 rounded-xl shadow-lg flex flex-col items-center text-center transition-all hover:shadow-xl"
              >
                <feature.icon size={48} className="text-white mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      {/* History Timeline */}
      <motion.section
        className="py-20 px-6 bg-zinc-900 text-black"
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
       
      </motion.section>

      {/* Global Impact */}
      {/* <motion.section
        className="py-20 px-6 bg-gradient-to-b from-neutral-600 via-neutral-900 to-black relative overflow-hidden"
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/50 to-black"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-white"
            variants={fadeInUp}
          >
            Global Impact
          </motion.h2>
          <motion.p
            className="text-zinc-200 text-lg text-center leading-relaxed max-w-4xl mx-auto"
            variants={fadeInUp}
          >
         We empower emerging Africa markets by creating jobs and boosting infrastructure
          </motion.p>
        </div>
      </motion.section> */}

      {/* CTA */}
      <motion.section
        className="py-20 px-6 bg-black text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
          Build Now
        </h2>
        <p className="text-zinc-200 max-w-2xl mx-auto mb-10 text-lg">
        We empower emerging African markets by creating jobs and boosting infrastructure.
        </p>
        <Link href="/contact" passHref>
          <Button
            variant="default"
            size="lg"
            className="px-8 py-3 bg-zinc-800/80 border border-zinc-700 text-white rounded-full hover:bg-zinc-700 transition-all duration-300"
          >
            Get in Touch
          </Button>
        </Link>
      </motion.section>
    </div>
  );
};

export default About;
