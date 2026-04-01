import "./globals.css";
import localFont from "next/font/local";

const recoleta = localFont({
  src: "../fonts/Recoleta.otf",
  variable: "--font-recoleta",
  display: "swap",
});

export const metadata = {
  title: "Flourish: Build Character",
  description: "A daily virtue practice app",
  manifest: "/manifest.json",
  themeColor: "#f3afee",
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
