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
import TwitterIcon from "@mui/icons-material/Twitter";
import MusicVideoIcon from "@mui/icons-material/MusicVideo";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import ContactPageIcon from "@mui/icons-material/ContactPage";

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
                    <h3 className="text-lg font-semibold text-white mb-4">About Us</h3>
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/about"
                        className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                      >
                        Our Story
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
                  <FooterColumn>
                  <h3 className="text-lg font-semibold text-white mb-4 text-center md:text-left">Contact</h3>
            <div className="flex flex-col gap-3 items-start">
              {/* Email Us */}
              <Link
                href="mailto:support@potentia.com"
                className="relative flex items-center text-sm text-zinc-400 hover:text-white transition-colors duration-200 group w-full"
              >
                <span className="transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                  Email Us
                </span>
                <span className="absolute left-0 flex items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                  <EmailIcon className="w-5 h-5" />
                </span>
              </Link>

              {/* Call Us */}
              <Link
                href="tel:+1234567890"
                className="relative flex items-center text-sm text-zinc-400 hover:text-white transition-colors duration-200 group w-full"
              >
                <span className="transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                  Call Us
                </span>
                <span className="absolute left-0 flex items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                  <PhoneIcon className="w-5 h-5" />
                </span>
              </Link>

              {/* Contact Form */}
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
              <h3 className="text-lg font-semibold text-white mb-4">Social Media</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* VK */}
                <Link
                  href="https://vk.com/potentiadigital"
                  className="relative p-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
                >
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                    VK
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <PublicIcon className="w-5 h-5" />
                  </span>
                </Link>

                {/* YouTube */}
                <Link
                  href="https://www.youtube.com/@potentiadigital"
                  className="relative p-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
                >
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                    YouTube
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <YouTubeIcon className="w-5 h-5" />
                  </span>
                </Link>

                {/* Telegram Channel */}
                <Link
                  href="https://t.me/potentia_digital"
                  className="relative p-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
                >
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                    Telegram Channel
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <TelegramIcon className="w-5 h-5" />
                  </span>
                </Link>

                {/* Telegram User */}
                <Link
                  href="https://t.me/potentiadigital"
                  className="relative p-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
                >
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                    Telegram User
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <TelegramIcon className="w-5 h-5" />
                  </span>
                </Link>

                {/* Instagram */}
                <Link
                  href="https://www.instagram.com/potentia.digital?igsh=ZGEyYnFhajdiZjUz&utm_source=qr"
                  className="relative p-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
                >
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                    Instagram
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <InstagramIcon className="w-5 h-5" />
                  </span>
                </Link>

                {/* Facebook */}
                <Link
                  href="https://www.facebook.com/share/1YeRxGYzCj/?mibextid=wwXIfr"
                  className="relative p-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
                >
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                    Facebook
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <FacebookIcon className="w-5 h-5" />
                  </span>
                </Link>

                {/* X (Twitter) */}
                <Link
                  href="https://x.com/potentiapower"
                  className="relative p-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
                >
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                    X
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <TwitterIcon className="w-5 h-5" />
                  </span>
                </Link>

                {/* TikTok */}
                <Link
                  href="https://www.tiktok.com/@potentiadigital?_t=ZM-8uBQuhs3MSl&_r=1"
                  className="relative p-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
                >
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                    TikTok
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <MusicVideoIcon className="w-5 h-5" />
                  </span>
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