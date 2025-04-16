"use client";

import Navbar from "@/components/NavBar";
import FooterSection from "@/components/Footer";
import { usePathname } from "next/navigation";
import { ClerkLoaded } from "@clerk/nextjs";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/dashboard");

  return (
    <ClerkLoaded>
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? "flex min-h-screen items-center justify-center" : ""}>
        {children}
      </main>
      {!isAuthPage && <FooterSection />}
    </ClerkLoaded>
  );
}
