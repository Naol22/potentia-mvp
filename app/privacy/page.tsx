"use client";
import React from "react";
import { motion } from "framer-motion";
import Head from "next/head";

const PrivacyPolicy: React.FC = () => {
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

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-40 bg-black  overflow-hidden mt-20">
      {/* Gradient Overlay with Subtle Noise */}
      <div className="absolute  pointer-events-none" />
      <div className="absolute inset-0 opacity-10" />

      {/* Head for SEO */}
      <Head>
        <title>Privacy Policy | potentia</title>
        <meta
          name="description"
          content="potentia's Privacy Policy outlines how we collect, use, disclose, and protect your personal information."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://potentia-web.vercel.app/privacy" />
      </Head>

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
          Privacy Policy
        </motion.h1>
        <motion.p
          className="text-lg text-center text-zinc-300 max-w-2xl mx-auto mb-8"
          variants={fadeInUp}
        >
          Effective Date: April 2025
        </motion.p>
        <motion.p
          className="text-lg text-zinc-300 max-w-3xl mx-auto mb-12"
          variants={fadeInUp}
        >
          potentia (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) values your privacy. This Privacy Policy outlines how we collect, use, disclose, and protect your personal information when you visit our website or engage with our services.
        </motion.p>

        {/* Policy Content */}
        <motion.div
          className="bg-zinc-900 rounded-xl p-6 md:p-8 shadow-lg border border-zinc-800 mb-8"
          variants={fadeInUp}
        >
          <div className="space-y-8">
            {/* Section 1 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">1.</span>
                <span>Information We Collect</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                We may collect the following types of information when you visit our website or interact with our services:
              </p>
              <ul className="list-disc pl-16 mt-4 space-y-2 text-zinc-300">
                <li>
                  <span className="font-medium">Personal Information:</span> Name, email address, phone number, company name, and other contact details provided through forms or communications.
                </li>
                <li>
                  <span className="font-medium">Financial Information:</span> If you invest in our services or platforms, we may collect necessary billing or payment information (handled securely through third-party providers).
                </li>
                <li>
                  <span className="font-medium">Technical Data:</span> IP address, browser type, device identifiers, access times, and pages viewed to improve our website performance.
                </li>
                <li>
                  <span className="font-medium">Usage Data:</span> Information about how you interact with our website and services.
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">2.</span>
                <span>How We Use Your Information</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-16 mt-4 space-y-2 text-zinc-300">
                <li>Provide and manage our services, including Bitcoin mining subscriptions, hosting, and consulting.</li>
                <li>Respond to your inquiries and support requests.</li>
                <li>Improve our website&apos;s content, functionality, and user experience.</li>
                <li>Communicate company updates, offerings, and relevant industry news (if you opt in).</li>
                <li>Meet legal, regulatory, or contractual obligations.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">3.</span>
                <span>Sharing Your Information</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-16 mt-4 space-y-2 text-zinc-300">
                <li>With trusted third-party service providers who assist with operations (e.g., web hosting, email services, payment processors).</li>
                <li>To comply with legal obligations, law enforcement requests, or regulatory requirements.</li>
                <li>In connection with a merger, acquisition, or business restructuring.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">4.</span>
                <span>Cookies and Tracking Technologies</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-16 mt-4 space-y-2 text-zinc-300">
                <li>Understand user behavior and traffic patterns.</li>
                <li>Customize your experience on our website.</li>
                <li>Analyze performance and improve site functionality.</li>
              </ul>
              <p className="text-zinc-300 text-base leading-relaxed pl-10 mt-4">
                You may adjust your browser settings to reject cookies; however, this may affect your user experience.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">5.</span>
                <span>Data Security</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                We implement appropriate administrative, technical, and physical safeguards to protect your data against unauthorized access, alteration, or disclosure. However, no system is completely secure, and we cannot guarantee absolute security.
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">6.</span>
                <span>International Users</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                Our operations and infrastructure may span multiple jurisdictions. By using our services, you understand and agree that your information may be transferred to and stored in countries outside your country of residence, including those that may not have the same data protection laws.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">7.</span>
                <span>Your Rights and Choices</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                Depending on your location, you may have the following rights regarding your data:
              </p>
              <ul className="list-disc pl-16 mt-4 space-y-2 text-zinc-300">
                <li>Access to the personal information we hold about you.</li>
                <li>Request correction, deletion, or limitation of your personal information.</li>
                <li>Withdraw consent or object to processing, where applicable.</li>
                <li>Lodge a complaint with a data protection authority.</li>
              </ul>
              <p className="text-zinc-300 text-base leading-relaxed pl-10 mt-4">
                To exercise your rights, please contact us at <span className="text-white">info@potentia.digital</span>.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">8.</span>
                <span>Children&apos;s Privacy</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                potentia&apos;s services are not directed to children under 18. We do not knowingly collect information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">9.</span>
                <span>Changes to This Privacy Policy</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                We may update this Privacy Policy from time to time. When we do, we will revise the &quot;Effective Date&quot; above and post the updated policy on our website.
              </p>
            </div>

            {/* Section 10 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">10.</span>
                <span>Contact Us</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                If you have any questions or concerns about this Privacy Policy or our practices, please contact:
              </p>
              <div className="pl-10 mt-4 text-zinc-300">
                <p className="font-medium text-white">potentia</p>
                <p>info@potentia.digital</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default PrivacyPolicy;