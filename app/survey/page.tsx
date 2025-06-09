'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, PinIcon, CheckIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';

// Define survey questions
const questions = [
  { id: 'satisfaction', type: 'rating', label: 'Rate your satisfaction' },
  { id: 'completed', type: 'boolean', label: 'Did you complete your task?' },
  { id: 'issue', type: 'text', label: 'Any issues?' },
  { id: 'suggestion', type: 'text', label: 'Suggestions?' },
  { id: 'nps', type: 'rating', label: 'Net Promoter Score' },
];

// Particle component with enhanced randomized motion and selective scaling
const Particle = ({ left, delay }: { left: string; delay: number }) => {
  const randomYStart = -50 - Math.random() * 600; // Random start between -50 and -650
  const randomYEnd = 800 + Math.random() * 200; // Random end between 800 and 1000
  const randomDuration = 8 + Math.random() * 8; // Duration between 8–16 seconds
  const randomDelay = delay + Math.random() * 3; // Delay variation up to 3 seconds
  const randomSway = 10 + Math.random() * 20; // Sway amplitude between 10–30
  const shouldScale = Math.random() > 0.5; // 50% chance to scale

  return (
    <motion.div
      className={`absolute w-3 h-3 rounded-full opacity-50 bg-gradient-to-b from-white to-black animate-gradient-shift`}
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
const GlowingOrb = ({ left, delay }: { left: string; delay: number }) => {
  return (
    <motion.div
      className={`absolute w-12 h-12 rounded-full opacity-70 shadow-[0_0_20px_rgba(255,255,255,0.5)] bg-gradient-to-b from-white to-black animate-gradient-shift`}
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

const Hero = (): React.ReactElement => {
  const { scrollYProgress } = useScroll();
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const [showOrbs, setShowOrbs] = useState(false);
  // const [ripple,setRipple] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<{ [key: string]: number | boolean | string | null }>({});
  const [currentAnswer, setCurrentAnswer] = useState<number | boolean | string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refresh page after 30 seconds when submitted
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 30 * 1000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

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

  const currentQuestion = questions[step];
  const isLastQuestion = step === questions.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative min-h-screen flex flex-col items-center justify-center px-8 py-12 overflow-hidden transition-all duration-500 ease-out bg-gradient-to-br from-zinc-950 via-zinc-900 to-black`}
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* Background Particles */}
      {Array.from({ length: 25 }, (_, i) => (
        <Particle key={i} left={`${5 + i * 3.5}%`} delay={i * 0.15} />
      ))}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!showSurvey ? (
          <motion.div
            key="text-content"
            className={`flex flex-col space-y-6 max-w-lg w-full p-8 rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.1)] bg-zinc-900/30 border-zinc-700/50 backdrop-blur-md mx-auto`}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50, filter: 'blur(10px)' }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <div className="flex flex-col gap-1 mt-2">
              <span className={`text-xl text-white`}>🚀</span>
              <span className={`font-bold text-xl text-white`}>Potentia</span>
              <span className={`text-sm text-zinc-400`}>
                Empowering your digital future with sustainable Bitcoin mining solutions that drive innovation, economic growth, and global impact.{' '}
                <a
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline transition text-white hover:text-gray-300`}
                >
                  Contact Eng
                </a>{' '}
                |{' '}
                <a
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline transition text-white hover:text-gray-300`}
                >
                  Contact CEO
                </a>
              </span>
            </div>
            <div className="flex justify-center">
              <CheckCircleIcon className={`w-12 h-12 mb-4 text-white`} />
            </div>
            <motion.h1
              className={`text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-black`}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              How was your onboarding?
            </motion.h1>
            <motion.p
              className={`text-lg text-center text-zinc-300`}
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`font-medium py-3 px-8 rounded-xl w-48 mx-auto transition bg-gradient-to-r from-white to-black text-black hover:from-gray-200 hover:to-gray-800 animate-gradient-shift`}
              onClick={() => {
                setShowOrbs(true);
                // setRipple(true);
                setShowSurvey(true);
              }}
            >
              Give Feedback
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="survey-card"
            className={`max-w-lg w-full z-10 mx-auto`}
            initial={{ opacity: 0, scale: 0.8, y: 50, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <Card
              className={`p-10 mt-7 rounded-3xl backdrop-blur-md border shadow-[0_10px_30px_rgba(0,0,0,0.1)] relative overflow-hidden text-white bg-zinc-900/30 border-zinc-700/50 min-h-[400px]`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {/* Pin Icon Top Left */}
              <PinIcon className={`absolute top-4 left-4 w-6 h-6 drop-shadow text-white`} />

              {loading ? (
                <motion.div
                  className={`text-2xl font-bold flex items-center gap-4 text-white`}
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                >
                  <div className={`w-8 h-8 border-4 rounded-full animate-spin border-t-white border-white`} />
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
                    <CheckCircleIcon className={`mb-4 w-16 h-16 text-white`} />
                  </motion.div>
                  <motion.span
                    className={`text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-black`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    Thank you for your feedback!
                  </motion.span>
                  <motion.div
                    className={`text-center text-zinc-300`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <p className="mb-2">&quot;Your input shapes our future.&quot;</p>
                    <p className="text-sm mb-4">- A Grateful Team</p>
                  </motion.div>
                </motion.div>
              ) : (
                <>
                  {/* Error Message Display */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-center mb-6 p-4 rounded-lg bg-red-900/50 text-red-200`}
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  {/* Header Section */}
                  <motion.div
                    className="text-center mb-4" // reduced mb-8 to mb-4
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  >
                    <h1
                      className={`text-5xl font-bold text-transparent bg-clip-text relative inline-block bg-gradient-to-r from-white to-black`}
                    >
                      Your Opinion Matters
                      <motion.span
                        className="block mt-2 h-1 w-2/3 mx-auto rounded-full" // reduced mt-3 to mt-2
                        style={{
                          background: 'linear-gradient(90deg, #ffffff, #000000)',
                          boxShadow: '0 2px 12px rgba(255,255,255,0.3)',
                        }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
                      />
                    </h1>
                    <p className={`text-lg mt-2 text-zinc-300`}>Shape our services with your feedback.</p> {/* reduced mt-3 to mt-2 */}
                  </motion.div>

                  {/* Statistics Info Box */}
                  <motion.div
                    className="p-2 rounded-lg mb-4" // reduced p-4 to p-2 and mb-8 to mb-4
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <p className={`text-center text-zinc-300`}>Join 10,000+ customers who’ve shared their thoughts!</p>
                  </motion.div>

                  {/* Stepper Progress */}
                  <div className="flex justify-center mb-8">
                    {questions.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`w-12 h-12 mx-2 rounded-full flex items-center justify-center font-bold ${
                          index <= step
                            ? 'bg-gradient-to-r from-white to-black text-black'
                            : 'bg-zinc-700 text-white'
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
                        className={`text-5xl font-extrabold mb-6 text-center text-white`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        {currentQuestion.label}
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
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                              >
                                <Button
                                  onClick={() => setCurrentAnswer(value)}
                                  className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
                                    currentAnswer === value
                                      ? 'bg-gradient-to-r from-white to-black text-black animate-gradient-shift'
                                      : 'bg-zinc-800 text-white'
                                  } hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-800 hover:text-black`}
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
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <Button
                              onClick={() => setCurrentAnswer(true)}
                              className={`flex items-center px-8 py-4 rounded-xl shadow-lg transition-all duration-300 ${
                                currentAnswer === true
                                  ? 'bg-gradient-to-r from-white to-black text-black animate-gradient-shift'
                                  : 'bg-zinc-800 text-white'
                              } hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-800 hover:text-black`}
                              aria-label="Yes"
                            >
                              <CheckIcon className="mr-2 w-6 h-6" /> Yes
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <Button
                              onClick={() => setCurrentAnswer(false)}
                              className={`flex items-center px-8 py-4 rounded-xl shadow-lg transition-all duration-300 ${
                                currentAnswer === false
                                  ? 'bg-gradient-to-r from-white to-black text-black animate-gradient-shift'
                                  : 'bg-zinc-800 text-white'
                              } hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-800 hover:text-black`}
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
                            className={`p-4 m-2 rounded-xl w-full h-32 resize-none focus:ring-2 backdrop-blur-sm shadow-inner transition-all duration-300 border-zinc-700 bg-zinc-900/50 text-white focus:ring-white`}
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
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        >
                          <Button
                            onClick={isLastQuestion ? handleSubmit : () => handleNext(currentAnswer)}
                            className={`mt-8 w-full py-4 rounded-xl transition-all duration-300 bg-gradient-to-r from-white to-black text-black hover:from-gray-200 hover:to-gray-800 animate-gradient-shift`}
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
        className="relative w-full max-w-lg h-3/4 mt-8 mx-auto"
        style={{ transform: imageScale }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-3/4 h-3/4 bg-cover bg-center rounded-full overflow-hidden border-4 shadow-[0_0_20px_rgba(255,255,255,0.5)] border-white/50`}>
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

      {/* Glowing Orbs */}
      {showOrbs && (
        <>
          <GlowingOrb left="20%" delay={0} />
          <GlowingOrb left="50%" delay={0.2} />
          <GlowingOrb left="80%" delay={0.4} />
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