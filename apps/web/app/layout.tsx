import type { Metadata, Viewport } from "next";
import { Geist_Mono, Rubik } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { lowInternetInitScript } from "@/lib/low-internet-script";
import { siteConfig } from "@/lib/site";
import { themeInitScript } from "@/lib/theme-script";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  appleWebApp: { capable: true, title: siteConfig.name, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the scripts below add data-theme and data-low-internet to <html> before React starts.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${rubik.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: lowInternetInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
