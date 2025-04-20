'use client';
import React from 'react';
import { motion } from 'framer-motion';

const GlobalLoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <motion.div
        className="relative w-16 h-16"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Outer Circle - Pulsing Animation */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-white/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Inner Circle - Spinning Animation */}
        <motion.div
          className="absolute inset-2 rounded-full border-t-4 border-r-4 border-white/80"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        {/* Center Dot - Subtle Glow */}
        <motion.div
          className="absolute inset-5 rounded-full bg-white/50"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  );
};

export default GlobalLoadingScreen;