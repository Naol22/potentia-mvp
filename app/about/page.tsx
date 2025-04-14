"use client";
import React from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import {
  Globe,
  Bitcoin,
  HandCoins,
  Handshake,
  BatteryCharging,
  BookOpen,
  Blocks,
  Cpu,
  Shrub,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      "Potentia fosters financial inclusion by making Bitcoin mining accessible, unlocking economic opportunities in emerging markets.",
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
      "Harnessing renewable energy and efficient practices, we’re building a greener future for Bitcoin mining.",
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
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
};

const About = () => {
  return (
    <div className="bg-zinc-500 text-white overflow-hidden">
      {/* Head for SEO */}
      <Head>
        <title>About Potentia | Sustainable Bitcoin Mining in Africa</title>
        <meta
          name="description"
          content="Learn about Potentia, a startup revolutionizing Bitcoin mining with sustainable solutions in Africa and beyond. Discover our mission, vision, and impact."
        />
        <meta
          name="keywords"
          content="Bitcoin mining Africa, sustainable mining, Potentia startup, eco-friendly crypto, VOA interview"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://potentia-web.vercel.app/about" />
      </Head>

      {/* Hero Section */}
      <motion.section
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-40 pb-20 bg-gradient-to-b from-zinc-900 to-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none" />
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold text-center bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          About Potentia
        </motion.h1>
        <motion.p
          className="mt-6 max-w-3xl text-center text-lg md:text-xl text-zinc-200 leading-relaxed"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          We’re pioneering sustainable Bitcoin mining, blending advanced technology and renewable energy to empower communities and redefine profitability. Starting in Africa, our journey is just beginning—join us.
        </motion.p>
      </motion.section>

      {/* Mission & Vision */}
      <motion.section
        className="py-20 px-6 bg-black"
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Our Mission</h2>
            <p className="text-zinc-300 text-lg leading-relaxed">
              To harness Bitcoin mining as a force for economic empowerment and energy innovation, delivering sustainable, accessible solutions worldwide through cutting-edge tech and strategic alliances.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Our Vision</h2>
            <p className="text-zinc-300 text-lg leading-relaxed">
              To lead the world in sustainable Bitcoin mining, fostering financial freedom, economic growth, and a greener future where crypto powers progress.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Showcase */}
      <motion.section
        className="py-20 px-6 bg-zinc-900"
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
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-300 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* History Timeline */}
      <motion.section
        className="py-20 px-6 bg-white text-black"
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-zinc-900 tracking-tight"
            variants={fadeInUp}
          >
            Potentia’s Journey Begins
          </motion.h1>
          <div className="relative flex justify-center">
            <motion.div
              variants={fadeInUp}
              className="relative flex flex-col items-center gap-8 max-w-2xl w-full"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-zinc-900 to-zinc-700 rounded-full flex items-center justify-center shadow-xl z-10"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Globe size={40} className="text-white" />
              </motion.div>
              <div className="bg-zinc-50 p-8 rounded-xl shadow-lg border border-zinc-200 w-full text-center transition-all hover:shadow-2xl hover:border-zinc-300">
                <h2 className="text-3xl font-bold text-zinc-900 mb-4 bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  2025 - Africa’s Bitcoin Frontier
                </h2>
                <p className="text-zinc-700 text-lg leading-relaxed font-medium">
                  In 2025, CEO Robert Luft launched Potentia’s bold vision on Voice of America, spotlighting sustainable Bitcoin mining in Africa. We’re sparking innovation and economic empowerment—see how it all began.{" "}
                  <Link href="https://www.voaafrica.com/africa-54" target="_blank" rel="noopener noreferrer">
                    <span className="text-blue-600 hover:underline font-semibold transition-all hover:text-blue-800">
                      Watch the VOA Interview
                    </span>
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Global Impact */}
      <motion.section
        className="py-20 px-6 bg-white text-black"
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-zinc-900"
            variants={fadeInUp}
          >
            Global Impact
          </motion.h2>
          <motion.p
            className="text-zinc-700 text-lg leading-relaxed max-w-4xl mx-auto"
            variants={fadeInUp}
          >
            Potentia is redefining Bitcoin mining with a global mission. We empower emerging markets—like Africa—by creating jobs, boosting infrastructure, and championing renewable energy. Through strategic partnerships, we shape forward-thinking mining policies, ensuring sustainability and accessibility. Our commitment to efficiency and transparency drives not just the Bitcoin network, but a future where digital assets fuel economic progress worldwide.
          </motion.p>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="py-20 px-6 bg-zinc-900 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Build Now</h2>
        <p className="text-zinc-200 max-w-2xl mx-auto mb-10 text-lg">
          Ready to join Potentia&apos;s sustainable mining revolution? Let&apos;s build a greener, wealthier tomorrow together.
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