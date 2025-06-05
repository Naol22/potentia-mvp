"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const SuccessPage = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/check-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setStatus("success");
          setMessage(`Subscription successful! Check ${data.session.customer_email} for confirmation.`);
        })
        .catch(() => setStatus("failed"));
    }
  }, [sessionId]);

  if (status === "loading") return <div className="text-center text-white">Loading...</div>;
  if (status === "failed") return <div className="text-center text-red-400">Payment failed. Please try again.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-neutral-800 rounded-xl shadow-lg p-8 text-center max-w-md"
      >
        <h1 className="text-3xl font-bold mb-4">Success!</h1>
        <p className="text-lg">{message}</p>
        <motion.a
          href="/"
          className="mt-6 inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
          whileHover={{ scale: 1.05 }}
        >
          Back to Home
        </motion.a>
      </motion.div>
    </div>
  );
};

export default SuccessPage;
