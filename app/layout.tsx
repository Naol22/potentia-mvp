import type { Metadata } from "next";
import "../styles/globals.css";
// import "@fontsource/inter/400.css";
// import "@fontsource/inter/500.css";
// import "@fontsource/inter/600.css";
// import "@fontsource/inter/700.css";
import { NavbarProvider } from "@/context/NavBarContext";
import { Analytics } from "@vercel/analytics/react";
import { ClerkProvider } from "@clerk/nextjs";
import ClientLayout from "./ClientLayout";
import { dark } from "@clerk/themes";
// import { Inter} from 'next/font/google';

// const inter = Inter({
//   subsets: ['latin'],
//   display: 'swap',
//   weight: ['400', '500', '600', '700'],
// });



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
          colorBackground: "#000000",
          colorText: "#FFFFFF",
          colorPrimary: "#FFFFFF",
          colorInputBackground: "#1A1A1A",
          colorInputText: "#FFFFFF",
          colorNeutral: "#FFFFFF",
          borderRadius: "0.5rem",
        },
        elements: {
          card: "shadow-none",
          formButtonPrimary: "bg-white text-black hover:bg-gray-200",
          footerActionLink: "text-white hover:text-gray-300",
          headerTitle: "text-white",
          headerSubtitle: "text-white/80",
          socialButtonsIconButton: "text-white hover:bg-white/10",
          input: "border-white/20 focus:border-white/50",
        },
      }}
    >
      <html lang="en" className={` dark`} suppressHydrationWarning>
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