"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Globe, Briefcase } from "lucide-react";

const PotentiaServices: React.FC = () => {
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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  // Service data
  const services = [
    {
      title: "Hashrate Subscription Service",
      icon: <Server className="w-10 h-10" />,
      description: [
        "potentia's hashrate subscription model allows consumers to participate in Bitcoin mining without the high upfront costs, technical challenges, and maintenance of hardware. Subscribers receive daily Bitcoin payouts proportional to their subscription level.",
        "- Flexible monthly contracts offering predictable access to mining power, allowing subscribers to reliably anticipate their mining performance and plan their finances accordingly   ",

        
        "- Subscribers automatically earn daily Bitcoin payouts proportional to their subscription level, distributed based on the exact amount of mining power each user has committed to",

        "- Subscribers can progressively scale their investment from smaller monthly hashrate plans to significant mining capacity or equipment ownership.",
      ],
    },
    {
      title: "Hosting Marketplace & Infrastructure",
      icon: <Globe className="w-10 h-10" />,
      description: [
        "potentia provides hosting solutions for customers who prefer owning their Bitcoin mining hardware. Our hosting service includes facility operations, infrastructure management, equipment monitoring, maintenance, and performance optimization. ",
        "- State of the art data centers in strategically selected African locations, leveraging abundant renewable energy sources.",
        "- Comprehensive operational management covering security, maintenance, energy procurement, network uptime, and on-site staff support.",
        "- potentia's hosting marketplace allows customers to achieve operational efficiency and higher profitability, eliminating concerns related to infrastructure and equipment management.",
      ],
    },
    {
      title: "Strategic Bitcoin Consulting",
      icon: <Briefcase className="w-10 h-10" />,
      description: [
        "potentia offers specialized strategic consulting services designed for institutional investors, corporations, and government entities interested in leveraging Bitcoin mining for economic development, infrastructure growth, and diplomatic engagement. ",
        "- This consulting is anchored by potentia's proprietary 'Bitcoin Diplomacy' framework, promoting national economic integration of Bitcoin mining and strategic policy alignment.",
        "- Comprehensive strategy development for integrating Bitcoin mining into national GDP and economic policy frameworks, particularly in emerging markets.",
        "- Assistance in establishing clear, effective regulatory environments that attract international investment and entrepreneurial activity."
      ],
    },
  ];

  return (
    <section className="relative w-full py-20 bg-black text-white overflow-hidden mt-20">
       <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-white tracking-tight"
        >
         Our Products
        </motion.h1>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            potentia offers comprehensive Bitcoin mining solutions, from subscription-based mining to infrastructure hosting and strategic consulting.
          </p> */}
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {services.map((service, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover="hover"
            >
              <Card className="h-full bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="mb-4 text-white">{service.icon}</div>
                  <CardTitle className="text-xl md:text-2xl text-white">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <div className="space-y-4">
                    {service.description.map((paragraph, idx) => (
                      <p key={idx} className={ "text-base"}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <motion.div 
                    className="mt-6"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* <Button variant="outline" className="group border-zinc-700 text-white hover:bg-white hover:text-black">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button> */}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        {/* <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-semibold mb-6">Ready to Start Your Bitcoin Mining Journey?</h3>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Join Potentia today and discover how our innovative solutions can help you participate in the future of finance.
          </p>
          <Button className="bg-white text-black hover:bg-gray-200 hover:text-black text-lg px-8 py-6 h-auto">
            Get Started
          </Button>
        </motion.div> */}
      </div>
    </section>
  );
};

export default PotentiaServices;