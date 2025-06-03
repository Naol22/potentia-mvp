"use client";
import React from "react";
import { Footer, FooterColumn, FooterBottom, FooterContent } from "./ui/footer";
import Image from "next/image";
import Link from "next/link";
// import PublicIcon from "@mui/icons-material/Public";
// import YouTubeIcon from "@mui/icons-material/YouTube";
// import TelegramIcon from "@mui/icons-material/Telegram";
// import InstagramIcon from "@mui/icons-material/Instagram";
// import FacebookIcon from "@mui/icons-material/Facebook";
// import TwitterIcon from "@mui/icons-material/X";
// import MusicVideoIcon from "@mui/icons-material/MusicVideo";
// import EmailIcon from "@mui/icons-material/Email";
// import ContactPageIcon from "@mui/icons-material/ContactPage";


export default function FooterSection() {
  return (
    <footer className="w-full bg-black text-white px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <Footer className="bg-transparent border-t border-zinc-800">
          <FooterContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-10">
            {/* Logo Section */}
            <FooterColumn className="flex items-center justify-center md:items-start md:justify-start">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/Artboardw.png"
                  alt="Potentia Logo"
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </Link>
            </FooterColumn>

            {/* About Us Section */}
            <FooterColumn>
              <h3 className="text-lg font-semibold text-white mb-4">
                About Us
              </h3>
              <div className="flex flex-col gap-3">
                <Link
                  href="/learn"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  What is Bitcoin Mining?
                </Link>
                <Link
                  href="/about#mission"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  Mission
                </Link>
                <Link
                  href="/about#team"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  Team
                </Link>
              </div>
            </FooterColumn>

            {/* Contact Section */}
            {/* <FooterColumn>
              <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
              <div className="flex flex-col gap-3">
                <Link
                  href="mailto:support@potentia.com"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  Email Us
                </Link>
                <Link
                  href="tel:+1234567890"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  Call Us
                </Link>
                <Link
                  href="/contact"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  Contact Form
                </Link>
              </div>
            </FooterColumn> */}

            {/* Social Media Section */}
            {/* <FooterColumn>
              <h3 className="text-lg font-semibold text-white mb-4">
                Social Media
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="https://vk.com/potentiadigital"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  VK
                </Link>
                <Link
                  href="https://www.youtube.com/@potentiadigital"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  YouTube
                </Link>
                <Link
                  href="https://t.me/potentia_digital"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  Telegram Channel
                </Link>
                <Link
                  href="https://t.me/potentiadigital"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  Telegram User
                </Link>
                <Link
                  href="https://www.instagram.com/potentia.digital?igsh=ZGEyYnFhajdiZjUz&utm_source=qr"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  Instagram
                </Link>
                <Link
                  href="https://www.facebook.com/share/1YeRxGYzCj/?mibextid=wwXIfr"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  Facebook
                </Link>
                <Link
                  href="https://x.com/potentiapower"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  X
                </Link>
                <Link
                  href="https://www.tiktok.com/@potentiadigital?_t=ZM-8uBQuhs3MSl&_r=1"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  TikTok
                </Link>
              </div>
            </FooterColumn> */}
          </FooterContent>

          {/* Footer Bottom */}
          <FooterBottom className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-zinc-800 text-sm text-zinc-400">
            <div>© 2025 . All rights reserved.</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  );
}
