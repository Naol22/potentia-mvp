import type { Metadata } from "next";
import "../styles/globals.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import { NavbarProvider } from "@/context/NavBarContext";
import { Analytics } from "@vercel/analytics/react";
import { ClerkProvider } from "@clerk/nextjs";
import ClientLayout from "./ClientLayout"; 
import { dark } from '@clerk/themes'
import { ThemeProvider } from "@/components/theme-provider";

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
<ClerkProvider
      appearance={{
        baseTheme: [dark],  
        variables: {
          colorBackground: "#000000", // Black background
          colorText: "#FFFFFF", // White text
          colorPrimary: "#FFFFFF", // White for buttons/links
          colorInputBackground: "#1A1A1A", // Dark gray for inputs
          colorInputText: "#FFFFFF", // White text in inputs
          colorNeutral: "#FFFFFF", // White for borders/icons
          borderRadius: "0.5rem", // Rounded corners
        },
        elements: {
          card: "shadow-none", // Flat design, no shadow
          formButtonPrimary: "bg-white text-black hover:bg-gray-200", // White button, black text
          footerActionLink: "text-white hover:text-gray-300", // White links with hover effect
          headerTitle: "text-white", // Ensure header text is white
          headerSubtitle: "text-white/80", // Slightly muted subtitle
          socialButtonsIconButton: "text-white hover:bg-white/10", // Social buttons
          input: "border-white/20 focus:border-white/50", // Input borders
        },
      }}
    >
      <html lang="en">
        <head>
          <link rel="icon" href="/O.png" />
        </head>
        <body className="bg-black text-white">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavbarProvider>
              <ClientLayout>{children}</ClientLayout>
              <Analytics />
            </NavbarProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}