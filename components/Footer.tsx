"use client";
import React from "react";
import { Footer, FooterColumn, FooterBottom, FooterContent } from "./ui/footer";
import Image from "next/image";
import Link from "next/link";
import PublicIcon from "@mui/icons-material/Public";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TelegramIcon from "@mui/icons-material/Telegram";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/X";
import MusicVideoIcon from "@mui/icons-material/MusicVideo";
import EmailIcon from "@mui/icons-material/Email";
import ContactPageIcon from "@mui/icons-material/ContactPage";



export default function FooterSection() {
  return (
    <footer
      className="w-full text-white px-6 py-16"
      style={{
        background: "linear-gradient(135deg, #000000 0%, #111111 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <Footer className="bg-transparent border-t border-zinc-800">
          <FooterContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-10">
            {/* Logo Section */}
            <FooterColumn className="flex items-center justify-center md:items-start md:justify-start md:border-r md:border-white md:border-opacity-20">
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
            <FooterColumn className="md:border-r md:border-white md:border-opacity-20">
              <h3 className="text-lg font-semibold text-white mb-4 relative group inline-block">
                About Us
                <span className="absolute bottom-0 left-0 h-0.5 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ width: '40%' }}></span>
              </h3>
              <div className="flex flex-col gap-3">
                <Link
                  href="/about"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  About potentia
                </Link>
                <Link
                  href="/about#mission"
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  Mission
                </Link>
                <Link
                  href=""
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  Team
                </Link>
              </div>
            </FooterColumn>

            {/* Contact Section */}
            <FooterColumn className="md:border-r md:border-white md:border-opacity-20">
              <h3 className="text-lg font-semibold text-white mb-4 relative group inline-block">
                Contact
                <span className="absolute bottom-0 left-0 h-0.5 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ width: '35%' }}></span>
              </h3>
              <div className="flex flex-col gap-3 items-start">
                <Link
                  href="mailto:info@potentia.digital"
                  className="relative flex items-center text-sm text-zinc-400 hover:text-white transition-colors duration-200 group w-full"
                >
                  <span className="transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                    Email Us
                  </span>
                  <span className="absolute left-0 flex items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <EmailIcon className="w-5 h-5" />
                  </span>
                </Link>
                <Link
                  href="/contact"
                  className="relative flex items-center text-sm text-zinc-400 hover:text-white transition-colors duration-200 group w-full"
                >
                  <span className="transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                    Contact Form
                  </span>
                  <span className="absolute left-0 flex items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <ContactPageIcon className="w-5 h-5" />
                  </span>
                </Link>
              </div>
            </FooterColumn>

            {/* Social Media Section */}
            <FooterColumn>
              <h3 className="text-lg font-semibold text-white mb-4 relative group inline-block">
                Social Media
                <span className="absolute bottom-0 left-0 h-0.5 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ width: '55%' }}></span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="https://vk.com/potentiadigital"
                  className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  <PublicIcon className="w-5 h-5" />
                  <span>VK</span>
                </Link>
                <Link
                  href="https://www.youtube.com/@potentiadigital"
                  className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  <YouTubeIcon className="w-5 h-5" />
                  <span>YouTube</span>
                </Link>
                <Link
                  href="https://t.me/potentia_digital"
                  className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  <TelegramIcon className="w-5 h-5" />
                  <span>Telegram Channel</span>
                </Link>
                <Link
                  href="https://t.me/potentiadigital"
                  className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  <TelegramIcon className="w-5 h-5" />
                  <span>Telegram User</span>
                </Link>
                <Link
                  href="https://www.instagram.com/potentia.digital?igsh=ZGEyYnFhajdiZjUz&utm_source=qr"
                  className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  <InstagramIcon className="w-5 h-5" />
                  <span>Instagram</span>
                </Link>
                <Link
                  href="https://www.facebook.com/share/1YeRxGYzCj/?mibextid=wwXIfr"
                  className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  <FacebookIcon className="w-5 h-5" />
                  <span>Facebook</span>
                </Link>
                <Link
                  href="https://x.com/potentiapower"
                  className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  <TwitterIcon className="w-5 h-5" />
                  <span>X</span>
                </Link>
                <Link
                  href="https://www.tiktok.com/@potentiadigital?_t=ZM-8uBQuhs3MSl&_r=1"
                  className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  <MusicVideoIcon className="w-5 h-5" />
                  <span>TikTok</span>
                </Link>
              </div>
            </FooterColumn>
          </FooterContent>

          {/* Footer Bottom */}
          <FooterBottom className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-zinc-800 text-sm text-zinc-400">
            <div>© 2025 Potentia. All rights reserved.</div>
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