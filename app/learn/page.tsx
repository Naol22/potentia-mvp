'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Learn = () => {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  const basicsSections = [
    {
      title: 'What is Bitcoin?',
      content: (
        <>
          <p>
            Bitcoin is the world&apos;s first decentralized digital currency, created in 2009 by an anonymous entity known as Satoshi Nakamoto. It allows peer-to-peer transactions without the need for intermediaries like banks, making it a revolutionary form of money.
          </p>
          <p className='mt-4'>
            Bitcoin operates on a decentralized ledger called the blockchain, where all transactions are recorded and verified by a network of computers (nodes) around the world. This ensures transparency, security, and immutability.
          </p>
          <a
            href='https://bitcoin.org/en/getting-started'
            target='_blank'
            rel='noopener noreferrer'
          >
            <Button variant='outline' className='mt-4 text-black' size='sm'>
              Learn More
            </Button>
          </a>
        </>
      ),
    },
    // ... other sections ...
  ];

  const advancedTopics = [
    {
      title: 'Advanced Mining Techniques',
      description:
        'Explore cutting-edge strategies and technologies that optimize mining efficiency and profitability.',
      link: 'https://www.bitcoinminingcouncil.com/resources',
    },
    // ... other topics ...
  ];

  return (
    <section className='relative bg-zinc-900/20 backdrop-blur-xl pt-40 pb-24 lg:pt-48 lg:pb-32 text-white overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-b from-zinc-900/60 via-zinc-900/40 to-zinc-800/80 pointer-events-none' />

      {/* Bitcoin Basics Header */}
      <div className='max-w-4xl mx-auto text-center px-6 lg:px-12'>
        <h1 className='text-4xl md:text-5xl lg:text-6xl font-light tracking-tight font-sans bg-gradient-to-r from-white to-zinc-100 bg-clip-text'>
          Bitcoin Basics
        </h1>
        <p className='mt-6 text-lg md:text-xl text-zinc-300 leading-relaxed'>
          Unlock the secrets of Bitcoin mining—explore the tech, economics, and energy driving the future of decentralized finance with Potentia&apos;s expertise.
        </p>
      </div>

      {/* Bitcoin Basics Sections */}
      <div className='max-w-4xl mx-auto mt-16 space-y-8 px-6 lg:px-12'>
        {basicsSections.map((section, index) => (
          <div
            key={index}
            onClick={() => toggleSection(index)}
            className='bg-zinc-900/40 backdrop-blur-lg rounded-xl border border-zinc-800/60 hover:border-zinc-700/60 cursor-pointer p-6 shadow-lg hover:shadow-xl transition-all duration-300'
          >
            <div className='flex justify-between items-center'>
              <h2 className='text-2xl md:text-3xl font-semibold text-white'>
                {section.title}
              </h2>
              <span
                className='text-zinc-400 text-2xl'
              >
                {openSection === index ? <ChevronUp /> : <ChevronDown />}
              </span>
            </div>
            <AnimatePresence>
              {openSection === index && (
                <div
                  className='mt-6 text-zinc-300 leading-relaxed'
                >
                  {section.content}
                </div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Advanced Bitcoin Education */}
      <section className='py-20 px-6 bg-zinc-900/20'>
        <div className='max-w-6xl mx-auto text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-12 text-white'>
            Advanced Bitcoin Education
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
            {advancedTopics.map((topic, index) => (
              <div
                key={index}
                className='bg-gradient-to-br from-zinc-800 to-black p-6 rounded-xl shadow-lg flex flex-col justify-between items-center text-center transition-all hover:shadow-xl'
              >
                <h3 className='text-lg font-semibold text-white mb-2'>{topic.title}</h3>
                <p className='text-zinc-300 text-sm leading-relaxed'>{topic.description}</p>
                <a href={topic.link} target='_blank' rel='noopener noreferrer'>
                  <Button variant='outline' className='mt-4 text-black' size='sm'>
                    Explore
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Exploration */}
      <section className='py-20 px-6 bg-zinc-900/20'>
        <div className='max-w-6xl mx-auto text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-12 text-white'>
            Explore Partnerships
          </h2>
          <p className='text-zinc-300 text-lg leading-relaxed max-w-4xl mx-auto'>
            Potentia&apos;s exploring partnerships with leading Bitcoin education programs to bring you the most comprehensive and up-to-date learning resources. Stay tuned for exciting collaborations that will empower you with the knowledge to thrive in the world of cryptocurrency.
          </p>
          <a href='/contact'>
            <Button
              className='mt-8 px-8 py-8 bg-black border border-zinc-700 text-white rounded-full hover:bg-zinc-700'
            >
              Get Involved
            </Button>
          </a>
        </div>
      </section>
    </section>
  );
};

export default Learn;