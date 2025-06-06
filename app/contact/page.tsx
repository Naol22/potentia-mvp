"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"; // Assuming ShadCN Button component
import emailjs from 'emailjs-com';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState({
    isSubmitting: false,
    isSuccess: false,
    error: null as string | null,
  });

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus({ isSubmitting: true, isSuccess: false, error: null });

    // EmailJS configuration - replace with your actual credentials
    emailjs.sendForm(
      'service_zx5mouj', // Replace with your EmailJS Service ID (e.g., 'godaddy_smtp')
      'template_7lry46r', // Replace with your EmailJS Template ID (e.g., 'template_abc123')
      e.target as HTMLFormElement,
      'HBAMpdkFZg0PpOzar' // Replace with your EmailJS User ID (e.g., 'user_xyz789')
    )
      .then((result) => {
        console.log(result.text);
        setFormStatus({ isSubmitting: false, isSuccess: true, error: null });
        setFormData({ name: "", email: "", message: "" });
      }, (error) => {
        console.log(error.text);
        setFormStatus({
          isSubmitting: false,
          isSuccess: false,
          error: error.text || "An error occurred while sending the email",
        });
      });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-40 bg-zinc-900/20 backdrop-blur-xl overflow-hidden">
      {/* Gradient Overlay with Subtle Noise */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/60 via-zinc-900/40 to-zinc-800/80 pointer-events-none" />
      <div className="absolute inset-0 opacity-10" />

      {/* Main Content */}
      <motion.div
        className="max-w-4xl w-full relative z-10"
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Header */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-center text-white font-sans bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent mb-8"
          variants={fadeInUp}
        >
          Contact Us
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-center text-zinc-300 max-w-2xl mx-auto mb-12"
          variants={fadeInUp}
        >
          Reach out to Potentia for inquiries about Bitcoin mining, high-performance computing, or grid support. We&apos;re here to help you pioneer the future.
        </motion.p>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            variants={fadeInUp}
            className="bg-zinc-900 rounded-xl p-6 md:p-8 shadow-lg border border-zinc-800"
          >
            <h2 className="text-2xl font-semibold text-white mb-6">Send Us a Message</h2>
            <form onSubmit={sendEmail} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-zinc-500"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-zinc-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-zinc-400 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-zinc-500"
                  placeholder="Your message here..."
                  required
                />
              </div>
              {formStatus.error && (
                <p className="text-red-500 text-sm">{formStatus.error}</p>
              )}
              {formStatus.isSuccess && (
                <p className="text-green-500 text-sm">Message sent successfully!</p>
              )}
              <Button
                variant="default"
                size="lg"
                type="submit"
                disabled={formStatus.isSubmitting}
                className="w-full"
              >
                {formStatus.isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>

          {/* Contact Information & Map */}
          <motion.div variants={fadeInUp} className="space-y-8">
            <div className="bg-zinc-900 rounded-xl p-6 md:p-8 shadow-lg border border-zinc-800">
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
              <p className="text-zinc-300 text-base leading-relaxed">
                <strong>Email:</strong> info@potentia.digital<br />
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ContactUs;