import type { Metadata, Viewport } from "next";
import { Geist_Mono, Rubik } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import { themeInitScript } from "@/lib/theme-script";
import "./globals.css";

const rubik = Rubik({ variable: "--font-rubik", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "BerryBlue Admin", template: "%s | BerryBlue Admin" },
  robots: { index: false, follow: false },
  icons: { icon: "/brand/pwa-192.png", apple: "/brand/pwa-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#0e0e10",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the script below sets data-theme on <html> before React starts.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${rubik.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-dvh">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
