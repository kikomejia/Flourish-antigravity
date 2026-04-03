import "./globals.css";
import localFont from "next/font/local";

const recoleta = localFont({
  src: "../fonts/Recoleta.otf",
  variable: "--font-recoleta",
  display: "swap",
});

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Flourish: Build Character",
  description: "A daily virtue practice app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Flourish",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3afee",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

import { ThemeProvider } from "@/lib/ThemeContext";
import { AuthProvider } from "@/lib/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={`${recoleta.variable} font-sans antialiased text-slate-900 bg-slate-50`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
