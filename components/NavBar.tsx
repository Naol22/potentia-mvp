"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavbar } from "@/context/NavBarContext";
import { usePathname } from "next/navigation";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { sticky } = useNavbar();
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileDropdownTimeout, setProfileDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const [mobileProfileDropdownOpen, setMobileProfileDropdownOpen] = useState(false);
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  // Track scroll progress
  const { scrollYProgress } = useScroll();

  // Map scroll progress to logo scale and y-position
  const logoScale = useTransform(scrollYProgress, [0, 1], [2.5, 1.3]);
  const logoY = useTransform(scrollYProgress, [0, 1], [10, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerClassName = `${
    sticky ? "fixed top-0 w-full z-30" : "relative"
  } transition-all duration-300 ${
    scrolled ? "bg-white shadow-md md:py-0 py-2" : "bg-transparent"
  }`;

  const linkClassName = `block px-6 py-2 transition-colors duration-300 ${
    scrolled ? "text-black" : "text-white"
  } hover:text-gray-300`;

  const mobileLinkClassName = `block px-6 py-3 text-white transition-colors duration-300 hover:text-gray-300`;

  const handleDropdownEnter = () => {
    if (dropdownTimeout) clearTimeout(dropdownTimeout);
    setDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    if (dropdownTimeout) clearTimeout(dropdownTimeout);
    setDropdownTimeout(
      setTimeout(() => {
        setDropdownOpen(false);
      }, 500)
    );
  };

  const handleProfileDropdownEnter = () => {
    if (profileDropdownTimeout) clearTimeout(profileDropdownTimeout);
    setProfileDropdownOpen(true);
  };

  const handleProfileDropdownLeave = () => {
    if (profileDropdownTimeout) clearTimeout(profileDropdownTimeout);
    setProfileDropdownTimeout(
      setTimeout(() => {
        setProfileDropdownOpen(false);
      }, 500)
    );
  };

  return (
    <motion.header className={headerClassName}>
      {/* Main container with top padding for mobile */}
      <div
        className={`max-w-7xl mx-auto px-6 ${
          scrolled ? "md:py-4 py-6 pt-8 md:pt-4" : "py-4 pt-8 md:pt-4"
        } flex justify-between items-center relative`}
      >
        {/* Left Navigation Links - Desktop Only */}
        <div className="hidden xl:flex space-x-8 items-center">
          <Link
            href="/"
            className={`${linkClassName} ${pathname === "/" ? "font-bold" : ""}`}
          >
            Home
          </Link>
          <Link href="/product" className={linkClassName}>
            Products
          </Link>
        </div>

        {/* Logo in the Center - Both Mobile and Desktop */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className={linkClassName}>
            <motion.img
              src={scrolled ? "/Artboardb.png" : "/Artboardw.png"}
              alt="Logo"
              width={90}
              height={40}
              className="transition-opacity duration-300"
              style={{
                scale: logoScale,
                y: logoY,
              }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
            />
          </Link>
        </div>

        {/* Right Navigation Links - Desktop Only */}
        <div className="hidden xl:flex space-x-8 items-center">
          <Link
            href="/about"
            className={`${linkClassName} ${pathname === "/about" ? "font-bold" : ""}`}
          >
            About
          </Link>
          <div
            className="relative"
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              className={`${linkClassName} flex items-center space-x-1 ${
                pathname === "/learn" || pathname === "/faq" ? "font-bold" : ""
              }`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span>More</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 inline-block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            {dropdownOpen && (
              <motion.div
                className={`absolute left-0 top-full mt-2 ${
                  scrolled ? "bg-white" : "bg-transparent"
                } text-black shadow-lg w-56 py-2 rounded-md z-40`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href="/learn"
                  className={`${linkClassName} hover:bg-gray-100 block ${
                    pathname === "/learn" ? "font-bold" : ""
                  }`}
                >
                  Learn
                </Link>
                <Link
                  href="/resources"
                  className={`${linkClassName} hover:bg-gray-100 block ${
                    pathname === "/faq" ? "font-bold" : ""
                  }`}
                >
                  Resources
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Absolutely Positioned Profile Icon - Desktop Only */}
      <div className="hidden xl:block absolute right-6 top-4">
        {isSignedIn ? (
          <UserButton />
        ) : (
          <div
            className="relative"
            onMouseEnter={handleProfileDropdownEnter}
            onMouseLeave={handleProfileDropdownLeave}
          >
            <button className="py-1 transition-colors duration-300">
              <Image
                src={scrolled ? "/profileb.png" : "/profile.png"}
                alt="Profile"
                width={32}
                height={32}
                className="transition-opacity duration-300"
                priority
              />
            </button>
            {profileDropdownOpen && (
              <motion.div
                className={`absolute right-0 top-full mt-2 ${
                  scrolled ? "bg-white" : "bg-transparent"
                } text-black shadow-lg w-40 py-2 rounded-md z-40`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SignInButton>
                  <button
                    className={`${linkClassName} hover:bg-gray-100 block w-full text-left`}
                  >
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button
                    className={`${linkClassName} hover:bg-gray-100 block w-full text-left`}
                  >
                    Sign Up
                  </button>
                </SignUpButton>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="xl:hidden flex justify-center items-center absolute right-6 top-4">
        <button
          className={`z-50 ${scrolled ? "text-black" : "text-white"}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation Links */}
      <motion.nav
        className="xl:hidden fixed top-0 right-0 h-full w-3/4 max-w-xs bg-black text-white shadow-lg z-40 overflow-y-auto"
        initial={{ x: "100%" }}
        animate={{ x: menuOpen ? 0 : "100%" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-start pt-20 px-6 pb-6 space-y-6 min-h-screen">
          <Link
            href="/"
            className={`${mobileLinkClassName} ${pathname === "/" ? "font-bold" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`${mobileLinkClassName} ${pathname === "/about" ? "font-bold" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            About Us
          </Link>
          <Link
            href="/product"
            className={`${mobileLinkClassName} ${pathname === "/product" ? "font-bold" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            href="/facilities"
            className={`${mobileLinkClassName} ${pathname === "/facilities" ? "font-bold" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Facilities
          </Link>
          <Link
            href="/learn"
            className={`${mobileLinkClassName} ${pathname === "/learn" ? "font-bold" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Learn
          </Link>
          <Link
            href="/resources"
            className={`${mobileLinkClassName} ${pathname === "/faq" ? "font-bold" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Resources
          </Link>

          {/* Mobile Profile Section with Clerk Integration */}
          <div className="relative w-full">
            {isSignedIn ? (
              <div className="flex items-center px-6 py-3">
                <UserButton />
                <span className={`${mobileLinkClassName} ml-2`}>Profile</span>
              </div>
            ) : (
              <>
                <button
                  className={`${mobileLinkClassName} flex items-center space-x-2 w-full`}
                  onClick={() => setMobileProfileDropdownOpen(!mobileProfileDropdownOpen)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </button>
                {mobileProfileDropdownOpen && (
                  <motion.div
                    className="pl-6 mt-2 space-y-3 w-full"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SignInButton>
                      <button
                        className={`${mobileLinkClassName} block w-full text-left`}
                        onClick={() => setMenuOpen(false)}
                      >
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button
                        className={`${mobileLinkClassName} block w-full text-left`}
                        onClick={() => setMenuOpen(false)}
                      >
                        Sign Up
                      </button>
                    </SignUpButton>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Overlay for Mobile Menu */}
      {menuOpen && (
        <motion.div
          className="xl:hidden fixed inset-0 bg-black/50 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </motion.header>
  );
};

export default Header;