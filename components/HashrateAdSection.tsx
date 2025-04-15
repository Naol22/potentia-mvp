import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

const hashrateOptions = [
  {
    title: '100 TH/s',
    description: 'Perfect for beginners dipping into Bitcoin mining with reliable output.',
    price: '$0.05/TH/s',
    estimatedOutput: '~0.005 BTC/month',
    image: '/gpuunlocked.png',
  },
  {
    title: '300 TH/s',
    description: 'Balanced power for enthusiasts seeking steady returns.',
    price: '$0.04/TH/s',
    estimatedOutput: '~0.015 BTC/month',
    image: '/gpuunlocked.png',
  },
  {
    title: '500 TH/s',
    description: 'High-efficiency plan for serious miners maximizing profits.',
    price: '$0.035/TH/s',
    estimatedOutput: '~0.025 BTC/month',
    image: '/gpuunlocked.png',
  },
  {
    title: '1000 TH/s',
    description: 'Ultimate performance for top-tier mining dominance.',
    price: '$0.03/TH/s',
    estimatedOutput: '~0.050 BTC/month',
    image: '/gpuunlocked.png',
  },
];

const cardVariants = {
  initial: {
    scale: 1,
    y: 0,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    background: 'linear-gradient(180deg, #ffffff, #f5f5f5)',
  },
  hover: {
    scale: 1.05,
    y: -10,
    boxShadow: '0px 12px 20px rgba(0, 0, 0, 0.2)',
    background: 'linear-gradient(180deg, #ffffff, #ffffff)',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export default function HashrateAdSection() {
  return (
    <section 
      className="py-16" 
      style={{ 
        background: `
          radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05), #000000),
          linear-gradient(135deg, 
            #000000,
            #000000 45%,
            rgba(255,255,255,0.1) 50%,
            #000000 55%,
            #000000
          )`,
        backgroundBlendMode: 'overlay',
        backgroundSize: '200% 200%',
        animation: 'flowAnimation 20s linear infinite'
      }}
    >
      <style>
        {`
          @keyframes flowAnimation {
            0% { background-position: 0% 50% }
            50% { background-position: 100% 50% }
            100% { background-position: 0% 50% }
          }
        `}
      </style>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Power Up Your Mining Journey
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Choose from our curated hashrate plans to start earning Bitcoin today. 
            Scalable, efficient, and designed for every miner.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {hashrateOptions.map((option, index) => (
            <Link
              key={option.title}
              href={{
                pathname: '/product',
                query: { tab: 'hashrate' },
              }}
              className="group"
            >
              <motion.div
                className="relative bg-white rounded-xl p-6 border border-gray-100 overflow-hidden"
                variants={cardVariants}
                initial="initial"
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex mb-4">
                  <Image
                    src={option.image}
                    alt={`${option.title} GPU`}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-2xl font-bold text-black mb-2">
                  {option.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
                  {option.description}
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-xl font-semibold text-black">
                    {option.price}
                  </p>
                  <p className="text-sm text-gray-500">
                    Est. {option.estimatedOutput}
                  </p>
                </div>
                <motion.div
                  className="inline-block text-sm font-medium text-white bg-neutral-900 px-4 py-2 rounded-full group-hover:bg-black group-hover:text-white transition-all"
                  whileHover={{ scale: 1.1 }}
                >
                  View Plan
                </motion.div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}