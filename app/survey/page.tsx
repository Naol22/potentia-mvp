'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform, useAnimation, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, SunIcon, MoonIcon, PinIcon, CheckIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';



// Define survey questions with Amharic labels
const questions = [
  { id: 'satisfaction', type: 'rating', label: 'Rate your satisfaction', amharicLabel: 'እርካታዎ ምን ያህል ነው?' },
  { id: 'completed', type: 'boolean', label: 'Did you complete your task?', amharicLabel: 'ተግባርዎን ጨርሰዋል?' },
  { id: 'issue', type: 'text', label: 'Any issues?', amharicLabel: 'ምን ችግር ገጥሞዎታል?' },
  { id: 'suggestion', type: 'text', label: 'Suggestions?', amharicLabel: 'ማንኛውም አስተያየት ወይም ሃሳብ አለዎት?' },
  { id: 'nps', type: 'rating', label: 'Net Promoter Score', amharicLabel: 'አገልግሎታችንን ለሌሎች ይመክራሉ?' },
];

// Particle component with enhanced randomized motion and selective scaling
const Particle = ({ left, delay, theme }: { left: string; delay: number; theme: 'dark' | 'light' }) => {
  const randomYStart = -50 - Math.random() * 600; // Random start between -50 and -650
  const randomYEnd = 800 + Math.random() * 200; // Random end between 800 and 1000
  const randomDuration = 8 + Math.random() * 8; // Duration between 8–16 seconds
  const randomDelay = delay + Math.random() * 3; // Delay variation up to 3 seconds
  const randomSway = 10 + Math.random() * 20; // Sway amplitude between 10–30
  const shouldScale = Math.random() > 0.5; // 50% chance to scale

  return (
    <motion.div
      className={`absolute w-3 h-3 rounded-full opacity-50 ${
        theme === 'dark' ? 'bg-gradient-to-b from-white to-black animate-gradient-shift' : 'bg-gradient-to-b from-black to-white animate-gradient-shift'
      } `}
      style={{ top: '0%', left }}
      initial={{ y: randomYStart, x: 0, opacity: 0.5, scale: 1 }}
      animate={{
        y: randomYEnd,
        x: [0, randomSway, -randomSway, 0], // Randomized horizontal sway
        opacity: 0,
        scale: shouldScale ? [1, 1.1 + Math.random() * 0.3, 1] : 1, // Scale only some particles
      }}
      transition={{
        repeat: Infinity,
        repeatType: 'loop',
        duration: randomDuration,
        delay: randomDelay,
        ease: [0.33, 0, 0.67, 1], // Smooth, floating ease
        x: { duration: randomDuration / 2, repeat: Infinity, ease: 'easeInOut' }, // Sway independently
      }}
    />
  );
};

// Glowing Orb component for dynamic animation
const GlowingOrb = ({ left, delay, theme }: { left: string; delay: number; theme: 'dark' | 'light' }) => {
  return (
    <motion.div
      className={`absolute w-12 h-12 rounded-full opacity-70 shadow-[0_0_20px_rgba(255,255,255,0.5)] ${
        theme === 'dark' ? 'bg-gradient-to-b from-white to-black animate-gradient-shift' : 'bg-gradient-to-b from-black to-white animate-gradient-shift'
      }`}
      style={{ bottom: '10%', left }}
      initial={{ y: 0, opacity: 0.7, scale: 1 }}
      animate={{ y: -800, opacity: 0, scale: 0.8 }}
      transition={{
        duration: 2.5,
        ease: 'easeOut',
        delay,
      }}
    />
  );
};

// Ball Trail component for afterimage effect
const BallTrail = ({ x, y, theme }: { x: number; y: number; theme: 'dark' | 'light' }) => {
  return (
    <motion.div
      className={`absolute w-20 h-20 rounded-full opacity-20 ${
        theme === 'dark' ? 'bg-gradient-to-b from-white to-black animate-gradient-shift' : 'bg-gradient-to-b from-black to-white animate-gradient-shift'
      }`}
      style={{ top: y, right: x }}
      initial={{ scale: 1, opacity: 0.2 }}
      animate={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.5 }}
    />
  );
};

// Burst Particle component for click/tap effect
const BurstParticle = ({ angle, distance, theme }: { angle: number; distance: number; theme: 'dark' | 'light' }) => {
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  return (
    <motion.div
      className={`absolute w-4 h-4 rounded-full opacity-80 ${
        theme === 'dark' ? 'bg-gradient-to-b from-white to-black animate-gradient-shift' : 'bg-gradient-to-b from-black to-white animate-gradient-shift'
      }`}
      initial={{ x: 0, y: 0, scale: 1, opacity: 0.8 }}
      animate={{ x, y, scale: 0, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  );
};

const Hero = (): React.ReactElement => {
  const { scrollYProgress } = useScroll();
  const ball1Y = useTransform(scrollYProgress, [0, 1], [-150, 150]);
  const ball1X = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const ball2Y = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const ball2X = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const lineStretch = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const [showOrbs, setShowOrbs] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [burst, setBurst] = useState<{ ball: number; x: number; y: number }[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showSurvey, setShowSurvey] = useState(false);
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<{ [key: string]: number | boolean | string | null }>({});
  const [currentAnswer, setCurrentAnswer] = useState<number | boolean | string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAmharic, setIsAmharic] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const ball1Controls = useAnimation();
  const ball2Controls = useAnimation();
  const lineControls = useAnimation();

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage on change
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Refresh page after 30 seconds when submitted
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 30 * 1000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setIsAmharic(!isAmharic);
  };

  // Handle next question
  const handleNext = (value: number | boolean | string | null) => {
    setResponses({ ...responses, [questions[step].id]: value });
    setCurrentAnswer(null);
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  // Handle survey submission
  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);
    const finalResponses = { ...responses, [questions[step].id]: currentAnswer };

    const payload = {
      satisfaction: Number(finalResponses.satisfaction),
      completed: Boolean(finalResponses.completed),
      issue: finalResponses.issue ? String(finalResponses.issue) : undefined,
      suggestion: finalResponses.suggestion ? String(finalResponses.suggestion) : undefined,
      nps: finalResponses.nps ? Number(finalResponses.nps) : undefined,
    };

    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit survey');
      }

      setLoading(false);
      setSubmitted(true);
    } catch (error) {
      setLoading(false);
      const err = error as Error;
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
      console.error('Submission error:', err);
    }
  };

  // Animation variants for balls
  const ballVariants = {
    default: {
      x: [0, 10, -10, 0],
      y: [0, 5, -5, 0],
      rotate: [0, 360],
      transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
    },
    ripple: {
      scale: [1, 1.15, 1],
      transition: { duration: 0.5, repeat: 1 },
    },
    touched: {
      scale: 1.3,
      background: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
      transition: { type: 'spring', stiffness: 300, damping: 20, mass: 1 },
    },
  };

  // Jitter and orbit animation for balls
  useEffect(() => {
    ball1Controls.start(ballVariants.default);
    ball2Controls.start({
      ...ballVariants.default,
      x: [0, -10, 10, 0],
      y: [0, -5, 5, 0],
      rotate: [-360, 0],
    });
  }, [ball1Controls, ball2Controls]);

  // Handle ripple effect
  useEffect(() => {
    if (ripple) {
      ball1Controls.start(ballVariants.ripple);
      ball2Controls.start(ballVariants.ripple);
      lineControls.start({
        strokeOpacity: [1, 0.5, 1],
        pathLength: [1, 1.2, 1],
        transition: { duration: 0.5, repeat: 1 },
      });
      setTimeout(() => setRipple(false), 1000);
    }
  }, [ripple, ball1Controls, ball2Controls, lineControls]);

  // Handle ball touch/click
  const handleBallTouch = (ballId: number, e: React.MouseEvent | React.TouchEvent) => {
    const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;
    setBurst((prev) => [...prev, { ball: ballId, x: clientX, y: clientY }]);
    if (ballId === 1) {
      ball1Controls.start(ballVariants.touched).then(() => {
        ball1Controls.start(ballVariants.default);
      });
    } else {
      ball2Controls.start(ballVariants.touched).then(() => {
        ball2Controls.start(ballVariants.default);
      });
    }
    lineControls.start({
      d: [
        `M calc(100% - 10rem - 5rem) 10rem Q calc(100% - 15rem) calc(50% - 5rem) calc(100% - 20rem - 5rem) calc(100% - 10rem)`,
        `M calc(100% - 10rem - 5rem) 10rem Q calc(100% - 18rem) calc(50% - 8rem) calc(100% - 20rem - 5rem) calc(100% - 10rem)`,
        `M calc(100% - 10rem - 5rem) 10rem Q calc(100% - 15rem) calc(50% - 5rem) calc(100% - 20rem - 5rem) calc(100% - 10rem)`,
      ],
      transition: { duration: 0.4, repeat: 1 },
    });
  };

  const currentQuestion = questions[step];
  const isLastQuestion = step === questions.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative min-h-screen flex flex-col md:flex-row items-center justify-center md:justify-between px-8 py-12 mt-58 overflow-hidden transition-all duration-500 ease-out ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-zinc-950 to-zinc-900'
          : 'bg-gradient-to-br from-gray-100 to-gray-200'
      }`}
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* Theme Toggle Button */}
      <motion.div
        className="fixed top-4 left-4 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={toggleTheme}
          className={`p-2 rounded-full ${
            theme === 'dark' ? 'bg-white text-black' : 'bg-gray-800 text-white'
          } hover:bg-opacity-80 transition-all duration-300`}
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: theme === 'dark' ? 360 : -360 }}
            transition={{ duration: 0.5 }}
          >
            {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </motion.div>
        </Button>
      </motion.div>

      {/* Background Particles */}
      {Array.from({ length: 25 }, (_, i) => (
        <Particle key={i} left={`${5 + i * 3.5}%`} delay={i * 0.15} theme={theme} />
      ))}

      {/* Left Section - Text Content or Survey Card */}
      <AnimatePresence mode="wait">
        {!showSurvey ? (
          <motion.div
            key="text-content"
            className={`flex flex-col space-y-6 max-w-lg w-full md:w-auto p-8 rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.1)] ${
              theme === 'dark' ? 'bg-zinc-900/30 border-zinc-700/50 backdrop-blur-md' : 'bg-white/80 border-gray-200 backdrop-blur-md'
            }`}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50, filter: 'blur(10px)' }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <div className="flex flex-col gap-1 mt-2">
              <span className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>🚀</span>
              <span className={`font-bold text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Potentia
              </span>
              <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                Empowering your digital future with sustainable Bitcoin mining solutions that drive innovation, economic growth, and global impact.{' '}
                <a
                  href="https://t.me/zatmelomaniaz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline transition ${
                    theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'
                  }`}
                >
                  Contact Eng
                </a>{' '}
                |{' '}
                <a
                  href="https://t.me/abualiya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline transition ${
                    theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'
                  }`}
                >
                  Contact CEO
                </a>
              </span>
            </div>
            <div className="flex justify-center">
              <CheckCircleIcon
                className={`w-12 h-12 mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
              />
            </div>
            <motion.h1
              className={`text-5xl font-bold text-center md:text-left text-transparent bg-clip-text ${
                theme === 'dark' ? 'bg-gradient-to-r from-white to-black' : 'bg-gradient-to-r from-black to-white'
              }`}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              How was your onboarding?
            </motion.h1>
            <motion.p
              className={`text-lg text-center md:text-left ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <span className="inline-block animate-[typewriter_2s_steps(20)_1s_1_normal_both]">
                Your feedback shapes our future!
              </span>
            </motion.p>
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.05, boxShadow: theme === 'dark' ? '0 0 15px rgba(255,255,255,0.5)' : '0 0 15px rgba(0,0,0,0.5)' }}
              whileTap={{ scale: 0.95 }}
              className={`font-medium py-3 px-8 rounded-xl w-48 mx-auto md:mx-0 transition shadow-[0_0_10px_rgba(255,255,255,0.5)] ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-white to-black text-black hover:from-white hover:to-gray-800 animate-gradient-shift'
                  : 'bg-gradient-to-r from-black to-white text-white hover:from-black hover:to-gray-200 animate-gradient-shift'
              }`}
              onClick={() => {
                setShowOrbs(true);
                setRipple(true);
                setShowSurvey(true);
              }}
            >
              Give Feedback
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="survey-card"
            className={`max-w-lg w-full md:w-auto z-10`}
            initial={{ opacity: 0, scale: 0.8, y: 50, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <Card
              className={`p-12 rounded-3xl backdrop-blur-md border shadow-[0_10px_30px_rgba(0,0,0,0.1)] relative overflow-hidden ${
                theme === 'dark' ? 'text-white bg-zinc-900/30 border-zinc-700/50' : 'text-gray-900 bg-white/80 border-gray-200'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {/* Language Toggle Button */}
              <Button
                onClick={toggleLanguage}
                className={`absolute top-4 right-4 rounded-xl px-6 py-2 shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-white to-black text-black hover:from-white hover:to-gray-800 animate-gradient-shift'
                    : 'bg-gradient-to-r from-black to-white text-white hover:from-black hover:to-gray-200 animate-gradient-shift'
                }`}
              >
                {isAmharic ? 'English' : 'አማርኛ'}
              </Button>

              {/* Pin Icon Top Left */}
              <PinIcon
                className={`absolute top-4 left-4 w-6 h-6 drop-shadow ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}
              />

              {loading ? (
                <motion.div
                  className={`text-2xl font-bold flex items-center gap-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                >
                  <div
                    className={`w-8 h-8 border-4 rounded-full animate-spin ${
                      theme === 'dark' ? 'border-t-white border-white' : 'border-t-black border-gray-900'
                    }`}
                  />
                  Submitting...
                </motion.div>
              ) : submitted ? (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  >
                    <CheckCircleIcon
                      className={`mb-4 w-16 h-16 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                    />
                  </motion.div>
                  <motion.span
                    className={`text-4xl font-bold mb-4 text-transparent bg-clip-text ${
                      theme === 'dark' ? 'bg-gradient-to-r from-white to-black' : 'bg-gradient-to-r from-black to-white'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    Thank you for your feedback!
                  </motion.span>
                  <motion.div
                    className={`text-center ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <p className="mb-2">"Your input shapes our future."</p>
                    <p className="text-sm mb-4">- A Grateful Team</p>
                    <p className={`${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      Enter to win a $50 gift card!
                    </p>
                  </motion.div>
                </motion.div>
              ) : (
                <>
                  {/* Error Message Display */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-center mb-6 p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  {/* Header Section */}
                  <motion.div
                    className="text-center mb-8"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  >
                    <h1
                      className={`text-5xl font-bold text-transparent bg-clip-text relative inline-block ${
                        theme === 'dark' ? 'bg-gradient-to-r from-white to-black' : 'bg-gradient-to-r from-black to-white'
                      }`}
                    >
                      {isAmharic ? 'አስተያየትዎ ለእኛ ጠቃሚ ነው!' : 'Your Opinion Matters'}
                      <motion.span
                        className="block mt-3 h-1 w-2/3 mx-auto rounded-full"
                        style={{
                          background: theme === 'dark'
                            ? 'linear-gradient(90deg, #ffffff, #000000)'
                            : 'linear-gradient(90deg, #000000, #ffffff)',
                          boxShadow: theme === 'dark' ? '0 2px 12px rgba(255,255,255,0.3)' : '0 2px 12px rgba(0,0,0,0.3)',
                        }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
                      />
                    </h1>
                    <p className={`text-lg mt-3 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}`}>
                      {isAmharic ? 'አስተያየትዎ አገልግሎቶቻችንን ያሻሽላል።' : 'Shape our services with your feedback.'}
                    </p>
                  </motion.div>

                  {/* Statistics Info Box */}
                  <motion.div
                    className="p-4 rounded-lg mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <p className={`text-center ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}`}>
                      {isAmharic ? 'ከ10,000+ ደንበኞች ጋር አስተያየትዎን ያካፍሉ!' : 'Join 10,000+ customers who’ve shared their thoughts!'}
                    </p>
                  </motion.div>

                  {/* Stepper Progress */}
                  <div className="flex justify-center mb-8">
                    {questions.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`w-12 h-12 mx-2 rounded-full flex items-center justify-center font-bold ${
                          index <= step
                            ? theme === 'dark'
                              ? 'bg-gradient-to-r from-white to-black text-black'
                              : 'bg-gradient-to-r from-black to-white text-white'
                            : theme === 'dark'
                            ? 'bg-zinc-700 text-white'
                            : 'bg-gray-300 text-gray-900'
                        }`}
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: index === step ? 1.2 : 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {index + 1}
                      </motion.div>
                    ))}
                  </div>

                  {/* Survey Question Rendering */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                      {/* Question Title */}
                      <motion.h2
                        className={`text-5xl font-extrabold mb-6 text-center ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        {isAmharic ? currentQuestion.amharicLabel : currentQuestion.label}
                      </motion.h2>

                      {/* Render Question Based on Type */}
                      {currentQuestion.type === 'rating' && (
                        <motion.div
                          className="flex flex-wrap justify-center gap-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                        >
                          {Array.from({ length: currentQuestion.id === 'nps' ? 11 : 5 }, (_, i) => {
                            const value = i + (currentQuestion.id === 'nps' ? 0 : 1);
                            return (
                              <motion.div
                                key={i}
                                whileHover={{ scale: 1.2, rotate: 5, boxShadow: theme === 'dark' ? '0 0 15px rgba(255,255,255,0.5)' : '0 0 15px rgba(0,0,0,0.5)' }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                              >
                                <Button
                                  onClick={() => setCurrentAnswer(value)}
                                  className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
                                    currentAnswer === value
                                      ? theme === 'dark'
                                        ? 'bg-gradient-to-r from-white to-black text-black animate-gradient-shift'
                                        : 'bg-gradient-to-r from-black to-white text-white animate-gradient-shift'
                                      : theme === 'dark'
                                      ? 'bg-zinc-800 text-white'
                                      : 'bg-gray-200 text-gray-900'
                                  } hover:bg-gradient-to-r ${theme === 'dark' ? 'hover:from-white hover:to-gray-800' : 'hover:from-black hover:to-gray-200'}`}
                                >
                                  {value}
                                </Button>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                      {currentQuestion.type === 'boolean' && (
                        <motion.div
                          className="flex justify-center gap-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                        >
                          <motion.div
                            whileHover={{ y: -10, scale: 1.1, boxShadow: theme === 'dark' ? '0 0 15px rgba(255,255,255,0.5)' : '0 0 15px rgba(0,0,0,0.5)' }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <Button
                              onClick={() => setCurrentAnswer(true)}
                              className={`flex items-center px-8 py-4 rounded-xl shadow-lg transition-all duration-300 ${
                                currentAnswer === true
                                  ? theme === 'dark'
                                    ? 'bg-gradient-to-r from-white to-black text-black animate-gradient-shift'
                                    : 'bg-gradient-to-r from-black to-white text-white animate-gradient-shift'
                                  : theme === 'dark'
                                  ? 'bg-zinc-800 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              } hover:bg-gradient-to-r ${theme === 'dark' ? 'hover:from-white hover:to-gray-800' : 'hover:from-black hover:to-gray-200'}`}
                              aria-label="Yes"
                            >
                              <CheckIcon className="mr-2 w-6 h-6" /> Yes
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ y: -10, scale: 1.1, boxShadow: theme === 'dark' ? '0 0 15px rgba(255,255,255,0.5)' : '0 0 15px rgba(0,0,0,0.5)' }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <Button
                              onClick={() => setCurrentAnswer(false)}
                              className={`flex items-center px-8 py-4 rounded-xl shadow-lg transition-all duration-300 ${
                                currentAnswer === false
                                  ? theme === 'dark'
                                    ? 'bg-gradient-to-r from-white to-black text-black animate-gradient-shift'
                                    : 'bg-gradient-to-r from-black to-white text-white animate-gradient-shift'
                                  : theme === 'dark'
                                  ? 'bg-zinc-800 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              } hover:bg-gradient-to-r ${theme === 'dark' ? 'hover:from-white hover:to-gray-800' : 'hover:from-black hover:to-gray-200'}`}
                              aria-label="No"
                            >
                              <XIcon className="mr-2 w-6 h-6" /> No
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                      {currentQuestion.type === 'text' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                        >
                          <label htmlFor="survey-text-input" className="sr-only">
                            {currentQuestion.label}
                          </label>
                          <textarea
                            id="survey-text-input"
                            value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            className={`p-4 m-2 rounded-xl w-full h-32 resize-none focus:ring-2 backdrop-blur-sm shadow-inner transition-all duration-300 ${
                              theme === 'dark'
                                ? 'border-zinc-700 bg-zinc-900/50 text-white focus:ring-white'
                                : 'border-gray-300 bg-gray-100/50 text-gray-900 focus:ring-black'
                            }`}
                            placeholder="Type your answer here..."
                          />
                        </motion.div>
                      )}

                      {/* Call-to-Action Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05, boxShadow: theme === 'dark' ? '0 10px 20px rgba(255,255,255,0.4)' : '0 10px 20px rgba(0,0,0,0.4)' }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        >
                          <Button
                            onClick={isLastQuestion ? handleSubmit : () => handleNext(currentAnswer)}
                            className={`mt-8 w-full py-4 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-300 ${
                              theme === 'dark'
                                ? 'bg-gradient-to-r from-white to-black text-black hover:from-white hover:to-gray-800 animate-gradient-shift'
                                : 'bg-gradient-to-r from-black to-white text-white hover:from-black hover:to-gray-200 animate-gradient-shift'
                            }`}
                            disabled={
                              currentAnswer == null ||
                              (currentQuestion.type === 'text' && typeof currentAnswer === 'string' && currentAnswer.trim() === '')
                            }
                          >
                            {isLastQuestion ? 'Submit' : 'Next'}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Section - Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 1, delay: 0.5, type: 'spring' }}
        className="relative w-full md:w-1/2 h-3/4 mt-8 md:mt-0"
        style={{ transform: imageScale }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-3/4 h-3/4 bg-cover bg-center rounded-full overflow-hidden border-4 shadow-[0_0_20px_rgba(255,255,255,0.5)] ${
              theme === 'dark' ? 'border-white/50' : 'border-black/50'
            }`}
          >
            <Image
              src="/hero-concept.webp"
              alt="Onboarding feedback"
              width={500}
              height={500}
              className="object-cover"
            />
          </div>
        </div>
      </motion.div>

      {/* Decorative Circles with Enhanced Dynamics */}
      <motion.div
        variants={ballVariants}
        animate={ball1Controls}
        style={{ y: ball1Y, x: ball1X }}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        whileHover={{ opacity: 0.8, boxShadow: theme === 'dark' ? '0 0 25px rgba(255,255,255,0.7)' : '0 0 25px rgba(0,0,0,0.7)' }}
        drag
        dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
        dragElastic={0.5}
        onClick={(e) => handleBallTouch(1, e)}
        onTouchStart={(e) => handleBallTouch(1, e)}
        className={`absolute top-10 right-10 w-40 h-40 rounded-full opacity-50 hidden md:block shadow-[0_0_15px_rgba(255,255,255,0.5)] cursor-pointer ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-white to-black animate-gradient-shift'
            : 'bg-gradient-to-br from-black to-white animate-gradient-shift'
        }`}
      >
        {/* Secondary Orbiting Ball */}
        <motion.div
          className={`absolute w-16 h-16 rounded-full opacity-70 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-white to-black animate-gradient-shift'
              : 'bg-gradient-to-br from-black to-white animate-gradient-shift'
          }`}
          animate={{
            x: [0, 50, 0, -50, 0],
            y: [0, 50, 0, -50, 0],
            rotate: [0, 360],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <BallTrail x={90} y={50} theme={theme} />
        {burst
          .filter((b) => b.ball === 1)
          .map((b, i) => (
            <BurstParticle
              key={`burst1-${i}`}
              angle={(i / 8) * 2 * Math.PI}
              distance={50}
              theme={theme}
            />
          ))}
      </motion.div>
      <motion.div
        variants={ballVariants}
        animate={ball2Controls}
        style={{ y: ball2Y, x: ball2X }}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        whileHover={{ opacity: 0.8, boxShadow: theme === 'dark' ? '0 0 25px rgba(255,255,255,0.7)' : '0 0 25px rgba(0,0,0,0.7)' }}
        drag
        dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
        dragElastic={0.5}
        onClick={(e) => handleBallTouch(2, e)}
        onTouchStart={(e) => handleBallTouch(2, e)}
        className={`absolute bottom-10 right-20 w-60 h-60 rounded-full opacity-50 hidden md:block shadow-[0_0_15px_rgba(255,255,255,0.5)] cursor-pointer ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-white to-black animate-gradient-shift'
            : 'bg-gradient-to-br from-black to-white animate-gradient-shift'
        }`}
      >
        <BallTrail x={100} y={100} theme={theme} />
        {burst
          .filter((b) => b.ball === 2)
          .map((b, i) => (
            <BurstParticle
              key={`burst2-${i}`}
              angle={(i / 8) * 2 * Math.PI}
              distance={60}
              theme={theme}
            />
          ))}
      </motion.div>

      {/* Dynamic Wavy Line with Pulse Effect */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.path
          animate={lineControls}
          d={`M calc(100% - 10rem - 5rem) 10rem Q calc(100% - 15rem) calc(50% - 5rem) calc(100% - 20rem - 5rem) calc(100% - 10rem)`}
          fill="none"
          stroke={`url(#lineGradient-${theme})`}
          strokeWidth="3"
          style={{ scale: lineStretch }}
          initial={{ pathLength: 0, strokeOpacity: 0.5 }}
          whileInView={{ pathLength: 1, strokeOpacity: 1 }}
          transition={{
            pathLength: { duration: 1.5, delay: 1.5 },
          }}
        >
          <defs>
            <linearGradient id={`lineGradient-${theme}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={theme === 'dark' ? '#ffffff' : '#000000'}>
                <animate
                  attributeName="stopColor"
                  values={theme === 'dark' ? '#ffffff;#000000;#ffffff' : '#000000;#ffffff;#000000'}
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor={theme === 'dark' ? '#000000' : '#ffffff'}>
                <animate
                  attributeName="stopColor"
                  values={theme === 'dark' ? '#000000;#ffffff;#000000' : '#ffffff;#000000;#ffffff'}
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          </defs>
        </motion.path>
      </svg>

      {/* Glowing Orbs */}
      {showOrbs && (
        <>
          <GlowingOrb left="20%" delay={0} theme={theme} />
          <GlowingOrb left="50%" delay={0.2} theme={theme} />
          <GlowingOrb left="80%" delay={0.4} theme={theme} />
        </>
      )}

      {/* CSS for Typewriter Animation and Gradient Shift */}
      <style jsx>{`
        @keyframes typewriter {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
        .animate-typewriter {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          animation: typewriter 2s steps(20) 1s 1 normal both;
        }
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
      `}</style>
    </motion.div>
  );
};

export default Hero;