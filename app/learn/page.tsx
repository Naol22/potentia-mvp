'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Learn = () => {
  const [openSection, setOpenSection] = useState<number | null >(null);

  const toggleSection = (index : number) => {
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
    {
      title: 'How Does Bitcoin Work?',
      content: (
        <>
          <p>
            Bitcoin transactions are grouped into blocks, which are added to the blockchain through a process called mining. Miners use powerful computers to solve complex mathematical problems, and the first miner to solve the problem gets to add the block and earn Bitcoin rewards.
          </p>
          <p className='mt-4'>
            The Bitcoin network adjusts the difficulty of these problems to ensure that blocks are added approximately every 10 minutes, maintaining a steady supply of new Bitcoins.
          </p>
          <a
            href='https://www.investopedia.com/terms/b/bitcoin.asp'
            target='_blank'
            rel='noopener noreferrer'
          >
            <Button variant='outline' className='mt-4 text-black' size='sm'>
              Explore Further
            </Button>
          </a>
        </>
      ),
    },
    {
      title: 'Bitcoin Mining Explained',
      content: (
        <>
          <p>
            Bitcoin mining is the process of validating transactions and securing the Bitcoin network. Miners use specialized hardware to solve cryptographic puzzles, and in return, they are rewarded with newly minted Bitcoins and transaction fees.
          </p>
          <p className='mt-4'>
            Mining is essential for maintaining the integrity of the Bitcoin blockchain, as it prevents double-spending and ensures that all transactions are legitimate.
          </p>
          <a
            href='https://www.coindesk.com/learn/what-is-bitcoin-mining/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <Button variant='outline' className='mt-4 text-black' size='sm'>
              Read More
            </Button>
          </a>
        </>
      ),
    },
    {
      title: 'The Importance of Decentralization',
      content: (
        <>
          <p>
            Decentralization is the core principle of Bitcoin. It means that no single entity controls the network, making it resistant to censorship, corruption, and manipulation.
          </p>
          <p className='mt-4'>
            This decentralized nature empowers individuals by giving them full control over their money, without relying on traditional financial institutions.
          </p>
          <a
            href='https://www.blockchain.com/learning-portal/decentralization'
            target='_blank'
            rel='noopener noreferrer'
          >
            <Button variant='outline' className='mt-4 text-black' size='sm'>
              Discover More
            </Button>
          </a>
        </>
      ),
    },
    {
      title: 'Bitcoin and Renewable Energy',
      content: (
        <>
          <p>
            Bitcoin mining has been criticized for its energy consumption, but it also presents an opportunity to drive innovation in renewable energy. At Potentia, we leverage renewable energy sources to power our mining operations, reducing our carbon footprint and promoting sustainability.
          </p>
          <p className='mt-4'>
            By using renewable energy, we not only make mining more environmentally friendly but also more cost-effective, ensuring long-term profitability.
          </p>
          <a
            href='https://www.forbes.com/sites/greatspeculations/2021/06/28/bitcoin-mining-and-renewable-energy/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <Button variant='outline' className='mt-4 text-black' size='sm'>
              Learn About Sustainability
            </Button>
          </a>
        </>
      ),
    },
  ];

  const advancedTopics = [
    {
      title: 'Advanced Mining Techniques',
      description:
        'Explore cutting-edge strategies and technologies that optimize mining efficiency and profitability.',
      link: 'https://www.bitcoinminingcouncil.com/resources',
    },
    {
      title: 'Bitcoin Economics',
      description:
        'Delve into the economic principles that underpin Bitcoin&apos;s value and its role in the global financial system.',
      link: 'https://www.kraken.com/learn/what-is-bitcoin-economics',
    },
    {
      title: 'Blockchain Technology Deep Dive',
      description:
        'Understand the technical intricacies of blockchain technology and its applications beyond Bitcoin.',
      link: 'https://www.coursera.org/learn/blockchain-basics',
    },
    {
      title: 'Future of Bitcoin and Cryptocurrency',
      description:
        'Explore predictions and trends shaping the future of Bitcoin and the broader cryptocurrency landscape.',
      link: 'https://www.coindesk.com/learn/the-future-of-bitcoin/',
    },
  ];

  return (
    <section className='relative bg-zinc-900/20 backdrop-blur-xl pt-40 pb-24 lg:pt-48 lg:pb-32 text-white overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-b from-zinc-900/60 via-zinc-900/40 to-zinc-800/80 pointer-events-none' />
      <div
        className='absolute inset-0'
        style={{ background: 'url(\'/noise.png\') repeat' }}
      />

      <div className='max-w-4xl mx-auto text-center px-6 lg:px-12'>
        <h1 className='text-4xl md:text-5xl lg:text-6xl font-light tracking-tight font-sans bg-gradient-to-r from-white to-zinc-100 bg-clip-text'>
          Bitcoin Basics
        </h1>
        <p className='mt-6 text-lg md:text-xl text-zinc-300 leading-relaxed'>
          Unlock the secrets of Bitcoin mining—explore the tech, economics, and
          energy driving the future of decentralized finance with
          Potentia&apos;s expertise.
        </p>
      </div>

      <div className='max-w-4xl mx-auto mt-16 space-y-8 px-6 lg:px-12'>
        {basicsSections.map((section, index) => (
          <div
            key={index}
            className='bg-zinc-900/40 backdrop-blur-lg rounded-xl border border-zinc-800/60 hover:border-zinc-700/60 cursor-pointer p-6 shadow-lg hover:shadow-xl transition-all duration-300'
            onClick={() => toggleSection(index)}
          >
            <div className='flex justify-between items-center'>
              <h2 className='text-2xl md:text-3xl font-semibold text-white'>
                {section.title}
              </h2>
              <span className='text-zinc-400 text-2xl'>
                {openSection === index ? <ChevronUp /> : <ChevronDown />}
              </span>
            </div>
            {openSection === index && (
              <div className='mt-6 text-zinc-300 leading-relaxed'>
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <section className='py-20 px-6 bg-zinc-900/20'>
        <div className='max-w-6xl mx-auto text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-12 text-white'>
            Advanced Bitcoin Education
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
            {advancedTopics.map((topic, index) => (
              <div
                key={index}
                className='bg-gradient-to-br from-zinc-800 to-black p-6 rounded-xl shadow-lg flex flex-col items-center text-center transition-all hover:shadow-xl'
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
              variant='default'
              size='lg'
              className='mt-8 px-8 py-3 bg-zinc-800/80 border border-zinc-700 text-white rounded-full hover:bg-zinc-700 transition-all duration-300'
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