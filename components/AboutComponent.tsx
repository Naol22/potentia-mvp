"use client";
import { motion } from "framer-motion";
import {
  BookOpenIcon,
  ChevronRightIcon,
  MessagesSquareIcon,
  ThumbsUpIcon,
} from "lucide-react";
import Link from "next/link";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function AboutComponent() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      className="w-full py-24 lg:py-32 p-20 text-white"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #111111 100%)' }}
    >
      <motion.div
        className="grid md:grid-cols-2 gap-12"
        variants={fadeUpVariant}
      >
        <motion.div className="lg:w-3/4" variants={fadeUpVariant}>
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
            Mission
          </h2>
          <p className="mt-3 text-gray-300">
            Leverage Bitcoin Mining as a catalsyt for economics empowerment,
            infrastructure growth and energy innovation on a global scale.
          </p>
          <p className="mt-5">
            <Link
              href="/about"
              className="inline-flex items-center gap-x-1 group font-medium hover:underline underline-offset-4 text-white"
            >
              Read More
              <ChevronRightIcon className="flex-shrink-0 w-4 h-4 transition ease-in-out group-hover:translate-x-1" />
            </Link>
          </p>
        </motion.div>

        <div className="space-y-6 lg:space-y-10">
          {[
            {
              icon: <BookOpenIcon className="w-5 h-5" />,
              title: "Industry Thought Leadership",
              desc: "Powering the future of Bitcoin mining with sustainable hosting solutions that drive global innovation, economic empowerment, and financial sovereignty.",
            },
            {
              icon: <MessagesSquareIcon className="w-5 h-5" />,
              title: "Global Partnership",
              desc: "Through strategic global partnerships, we shape forward-thinking Bitcoin Mining policies while delivering unparalleled value to investors in a rapidly evolving digital economy",
            },
            {
              icon: <ThumbsUpIcon className="w-5 h-5" />,
              title: "Simple to Use",
              desc: "Start mining Bitcoin effortlessly—our hosting service handles the setup, maintenance, and energy management for you.",
            },
          ].map((block, index) => (
            <motion.div
              key={index}
              className="flex"
              variants={fadeUpVariant}
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              <span className="flex-shrink-0 inline-flex justify-center items-center w-[46px] h-[46px] rounded-full border bg-primary text-primary-foreground">
                {block.icon}
              </span>
              <div className="ms-5 sm:ms-8">
                <h3 className="text-base sm:text-lg font-semibold">
                  {block.title}
                </h3>
                <p className="mt-1 text-muted-foreground">{block.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
