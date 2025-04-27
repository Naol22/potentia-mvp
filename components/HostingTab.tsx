'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import FlatMap3D from './FlatMap3D';





const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const HostingTab = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  // const scrollRef = useRef<HTMLDivElement>(null);
  const [showTourModal, setShowTourModal] = useState(false);
  const [currentTourId, setCurrentTourId] = useState<string | null>(null);

  // Add this function to open the virtual tour
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const openVirtualTour = (facilityName: string) => {
    // Map facility names to tour IDs
    const tourMapping: Record<string, string> = {
      'Ethiopia': 'ethiopia',
      'Dubai': 'dubai',
      'Texas, Fort Worth': 'texas',
      'Paraguay, Villarica': 'paraguay',
      'Georgia, Tbilisi': 'georgia',
      'Finland, Heat Recovery': 'finland'
    };
    
    const tourId = tourMapping[facilityName];
    if (tourId) {
      setCurrentTourId(tourId);
      setShowTourModal(true);
    }
  };
  
  // Add this function to close the tour modal
  const closeTourModal = () => {
    setShowTourModal(false);
    setCurrentTourId(null);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  

  const faqs = [
    {
      question: 'What is cloud mining and how does it work?',
      answer:
        'Cloud mining lets you mine cryptocurrencies like Bitcoin without managing hardware. At Potentia, you rent hash power from our advanced data centers, where we handle setup, maintenance, and power. Rewards are based on your hash rate and network difficulty, paid directly to your wallet. It&apos;s simple and ideal for all experience levels.',
    },
    {
      question: 'How do I choose the best facility for my needs?',
      answer:
        'Pick a facility based on electricity cost, capacity, or location benefits. Ethiopia offers 4.0ct/kWh with hydro power, great for savings. Dubai uses solar/grid with smart tech for reliability. Texas supports larger operations with 25 MW capacity. Check each facility&apos;s price, setup fees, and power source via the "View Facility" button to match your mining goals.',
    },
    {
      question: 'What are the payment options and refund policies?',
      answer:
        'We accept Bitcoin, Ethereum, Litecoin, credit/debit cards (Visa, MasterCard, Amex) via Stripe, and bank transfers. Crypto and card payments are instant; bank transfers may take longer. Refunds are available within 7 days if mining hasn&apos;t started, with a 5% fee. Reach our 24/7 support for payment or refund help.',
    },
    {
      question: 'How profitable is cloud mining with Potentia?',
      answer:
        'Profits vary by hash rate, plan, facility, and market conditions. Our low-cost facilities maximize returns. We&apos;re adding a profitability calculator soon to help estimate earnings.',
    },
    {
      question: 'How secure are your hosting facilities?',
      answer:
        'Our facilities have 24/7 surveillance, biometric access, and backup power for up to 99.9% uptime. Your data is encrypted end-to-end, and rewards are securely transferred. Regular audits ensure compliance, so you can mine with confidence.',
    },
    {
      question: 'Can I scale my mining operation over time?',
      answer:
        'Yes! Start small and scale up by adding hash power, extending plans, or switching facilities. Our Texas and Ethiopia sites support large-scale mining with up to 30 MW capacity. Contact us to tailor a plan that grows with you.',
    },
  ];

  return (
    <>
      {/* Existing styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes flowAnimation {
              0% { background-position: 0% 50% }
              50% { background-position: 100% 50% }
              100% { background-position: 0% 50% }
            }
          `,
        }}
      />
      

      {showTourModal && currentTourId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90">
          <div className="absolute top-4 right-4 z-[10000]">
            <button 
              onClick={closeTourModal}
              className="bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="w-screen h-screen relative">
            <iframe
              src={`/api/tours/${currentTourId}`}
              title="Virtual Tour"
              className="w-full h-full border-0"
              allowFullScreen
            />
            {/* Overlay image */}
            <div className="absolute bottom-4 right-4 z-[10000] pointer-events-none">
              <Image 
                src="/Artboardw.png" 
                alt="Potentia" 
                width={120} 
                height={60}
                className="opacity-80"
              />
            </div>
          </div>
        </div>
      )}
      
      <motion.section
        className="py-4 px-6 text-white"
        style={{ 
          background: `
            radial-gradient(
              circle at 20% 30%, 
              rgba(255,255,255,0.05),
              #000000
            ),
            linear-gradient(
              135deg,
              #000000,
              #000000 45%,
              rgba(255,255,255,0.1) 50%,
              #000000 55%,
              #000000
            )
          `,
          backgroundBlendMode: 'overlay',
          backgroundSize: '200% 200%',
          animation: 'flowAnimation 20s linear infinite'
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-6xl mx-auto">
          

          <motion.div
            className="mt-2 bg-transparent"
            style={{ width: "120vw", maxWidth: "1500px", marginLeft: "-8vw", marginRight: "-12vm" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <FlatMap3D />
          </motion.div>

          <motion.div
            className="mt-12 bg-gradient-to-b from-zinc-700/60 via-zinc-900/40 to-black p-6 rounded-lg shadow-md border border-neutral-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-white">
              Why Choose Our Hosting Services?
            </h2>
            <p className="text-white leading-relaxed mb-6">
              Potentia&apos;s hosting services make cryptocurrency mining accessible
              and efficient. We manage state-of-the-art facilities worldwide,
              handling hardware, power, and maintenance so you can focus on
              earning rewards. Our data centers in Ethiopia, Dubai, Texas, and
              more offer low electricity rates, advanced cooling, and 24/7
              security. Whether you&apos;re new or experienced, our scalable solutions
              maximize profits with minimal hassle.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                className="p-6 bg-black rounded-lg border border-neutral-600"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Global Facilities
                </h3>
                <p className="text-sm text-white">
                  Mine from top-tier data centers across multiple continents,
                  optimized for cost and performance.
                </p>
              </motion.div>
              <motion.div
                className="p-6 bg-black rounded-lg border border-neutral-600"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Sustainable Mining
                </h3>
                <p className="text-sm text-white">
                  Use hydro and solar-powered facilities like Ethiopia and Dubai
                  for eco-friendly operations.
                </p>
              </motion.div>
              <motion.div
                className="p-6 bg-black rounded-lg border border-neutral-600"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Round-the-Clock Support
                </h3>
                <p className="text-sm text-white">
                  Our team is available 24/7 to ensure your mining runs smoothly.
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="mt-12 bg-gradient-to-b from-zinc-700/60 via-zinc-900/40 to-black p-6 rounded-lg shadow-md border border-neutral-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-white">
              Frequently Asked Questions
            </h2>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="border-b border-neutral-300 py-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <button
                    className="w-full flex justify-between items-center text-lg font-semibold cursor-pointer text-left text-white"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span>{faq.question}</span>
                    <ChevronIcon isOpen={openFAQ === index} />
                  </button>
                  <AnimatePresence>
                    {openFAQ === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-white leading-relaxed mt-2">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
};

export default HostingTab;