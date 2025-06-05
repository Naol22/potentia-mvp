"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import GlobalLoadingScreen from "@/components/GlobalLoadingScreen";

const SuccessPage = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [plan, setPlan] = useState("");
  const [planDetails, setPlanDetails] = useState<{
    hashrate: number;
    price: number;
    currency: string;
    duration: string;
  } | null>(null);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      Promise.all([
        fetch(`/api/check-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        }),
        fetch(`/api/subscription-sessions?session_id=${sessionId}`, {
          headers: { "Content-Type": "application/json" },
        }),
      ])
        .then(([sessionRes, sessionDataRes]) => Promise.all([sessionRes.json(), sessionDataRes.json()]))
        .then(([sessionData, sessionDataResult]) => {
          if (sessionData.error) throw new Error(sessionData.error);
          console.log("[SuccessPage] Session data result:", sessionDataResult); // Debug log
          if (sessionDataResult.error) throw new Error(sessionDataResult.error);
          const email = sessionData.session?.customer_email || "your registered email";
          const planId = sessionDataResult.data[0]?.metadata?.planId || "Unknown Plan";
          console.log("[SuccessPage] Retrieved planId:", { planId }); // Debug log
          setPlan(planId);
          setMessage(`Congratulations! Your Potentia subscription is active. Check ${email} for confirmation.`);

          if (planId && planId !== "Unknown Plan") {
            return fetch(`/api/hashrate-plans/${planId}`).then((res) => res.json());
          }
          throw new Error("Invalid planId");
        })
        .then((planData) => {
          if (planData.error) throw new Error(planData.error);
          setPlanDetails({
            hashrate: planData.hashrate,
            price: planData.price,
            currency: planData.currency,
            duration: planData.duration,
          });
          setStatus("success");
        })
        .catch((error) => {
          console.error("[SuccessPage] Error fetching plan details:", { message: error.message });
          setStatus("failed");
        });
    }
  }, [sessionId]);

  if (status === "loading") return <GlobalLoadingScreen />;
  if (status === "failed") return <div className="text-center text-red-400">Payment failed or plan details unavailable. Please try again or contact support.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-[#1e3a8a] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-white from-transparent via-neutral-800/50 to-transparent animate-pulse"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-neutral-800 rounded-xl shadow-xl p-8 text-center max-w-md z-10 relative backdrop-blur-sm"
      >
        <motion.h1
          className="text-4xl font-bold mb-6 text-white"
          animate={{ scale: [1, 1.02, 1], opacity: [1, 0.9, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Success!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-xl mb-8"
        >
          {message}
        </motion.p>
        {planDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-neutral-700 rounded-lg p-5 mb-8 text-left shadow-inner"
          >
            <h2 className="text-lg font-semibold mb-3 text-white">Plan Details</h2>
            <p className="text-base text-gray-200">Hashrate: {planDetails.hashrate} TH/s</p>
            <p className="text-base text-gray-200">Price: {planDetails.price} {planDetails.currency}</p>
            <p className="text-base text-gray-200">Duration: {planDetails.duration}</p>
          </motion.div>
        )}
        <div className="space-x-6">
          <motion.a
            href="/dashboard"
            className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
            whileHover={{ scale: 1.1, backgroundColor: "#e5e7eb" }}
            whileTap={{ scale: 0.95 }}
          >
            Go to Dashboard
          </motion.a>
          <motion.a
            href="/survey"
            className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
            whileHover={{ scale: 1.1, backgroundColor: "#e5e7eb" }}
            whileTap={{ scale: 0.95 }}
          >
            Surveys
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;