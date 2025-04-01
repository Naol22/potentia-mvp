import type { Metadata } from "next";
import "../styles/globals.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import { NavbarProvider } from "@/context/NavBarContext";
import { Analytics } from "@vercel/analytics/react";
import { ClerkProvider } from "@clerk/nextjs";
import ClientLayout from "./ClientLayout"; // New client component

export const metadata: Metadata = {
  title: "Potentia",
  description: "Bitcoin Mining",
  icons: {
    icon: "/O.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/O.png" />
        </head>
        <body className="bg-black text-white">
          <NavbarProvider>
            <ClientLayout>{children}</ClientLayout>
            <Analytics />
          </NavbarProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}