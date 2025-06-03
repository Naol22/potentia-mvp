"use client";
import React from "react";
import { motion } from "framer-motion";
import Head from "next/head";

const TermsOfService: React.FC = () => {
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
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-40 bg-black backdrop-blur-xl overflow-hidden mt-20">
      {/* Gradient Overlay with Subtle Noise */}
      <div className="absolute  pointer-events-none" />
      <div className="absolute inset-0 opacity-10" />

      {/* Head for SEO */}
      <Head>
        <title>Terms of Service | potentia</title>
        <meta
          name="description"
          content="potentia's Terms of Service govern your access to and use of our website and services."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://potentia-web.vercel.app/terms" />
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
          Terms of Service
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
          Welcome to the potentia website (the &quot;Site&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Site and any services, content, or materials provided by potentia (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using our Site, you agree to be bound by these Terms.
        </motion.p>

        {/* Terms Content */}
        <motion.div
          className="bg-zinc-900 rounded-xl p-6 md:p-8 shadow-lg border border-zinc-800 mb-8"
          variants={fadeInUp}
        >
          <div className="space-y-8">
            {/* Section 1 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">1.</span>
                <span>Use of the Site</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                You may use the Site for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-16 mt-4 space-y-2 text-zinc-300">
                <li>Use the Site in any way that violates applicable laws or regulations.</li>
                <li>Attempt to gain unauthorized access to any part of the Site or related systems.</li>
                <li>Use the Site to distribute any malicious code, spam, or disruptive content.</li>
                <li>Engage in any activity that interferes with or disrupts the operation of the Site.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">2.</span>
                <span>Eligibility</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                You must be at least 18 years old to access or use our Site. By using the Site, you represent that you meet this requirement and have the legal capacity to enter into a binding agreement.
              </p>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">3.</span>
                <span>Intellectual Property</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                All content on the Site, including text, graphics, logos, and software, is the property of potentia or its licensors and is protected by intellectual property laws. You may not use, copy, modify, distribute, or exploit any content without our prior written permission.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">4.</span>
                <span>User Submissions</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                If you submit any content or information to us through the Site (e.g., contact forms, email inquiries), you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such content for the purpose of operating and improving our services.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">5.</span>
                <span>Third-Party Links</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                The Site may contain links to third-party websites or services. We do not control and are not responsible for the content or practices of these third-party sites. Accessing them is at your own risk.
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">6.</span>
                <span>No Investment Advice</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                The information provided on this Site is for informational purposes only and does not constitute financial, investment, or legal advice. potentia does not guarantee any financial returns or outcomes related to Bitcoin mining, hosting, or consulting services. Users should conduct their own due diligence or consult with professional advisors before making any decisions.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">7.</span>
                <span>Disclaimer of Warranties</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                The Site is provided &quot;as is&quot; and &quot;as available.&quot; We make no warranties, express or implied, regarding the Site or its content, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">8.</span>
                <span>Limitation of Liability</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                To the fullest extent permitted by law, potentia shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising from your use of or reliance on the Site or its content.
              </p>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">9.</span>
                <span>Indemnification</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                You agree to defend, indemnify, and hold harmless potentia and its affiliates from and against any claims, damages, liabilities, or expenses arising out of your use of the Site, violation of these Terms, or infringement of any rights of a third party.
              </p>
            </div>

            {/* Section 10 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">10.</span>
                <span>Changes to the Terms</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                We may update these Terms from time to time. If we make material changes, we will notify users by updating the &quot;Effective Date&quot; at the top of the page. Your continued use of the Site constitutes acceptance of the revised Terms.
              </p>
            </div>

            {/* Section 11 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">11.</span>
                <span>Governing Law</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                These Terms are governed by the laws of Texas, without regard to conflict of law principles. Any disputes shall be resolved in the courts located in the State of Texas.
              </p>
            </div>

            {/* Section 12 */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex">
                <span className="mr-4 text-zinc-400">12.</span>
                <span>Contact Us</span>
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed pl-10">
                If you have any questions or concerns about these Terms, please contact:
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

export default TermsOfService;