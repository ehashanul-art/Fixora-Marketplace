import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Fixora Marketplace | Home & Office Essentials",
  description:
    "Modern marketplace for homes, offices, apartments and commercial buildings. Buy ACs, TVs, refrigerators, electronics, appliances, smart-home devices, lighting, furniture, tools and more.",
  keywords: [
    "marketplace",
    "electronics",
    "appliances",
    "furniture",
    "smart-home",
    "CCTV",
    "tools",
  ],
  openGraph: {
    title: "Fixora Marketplace",
    description:
      "Modern marketplace for homes, offices, apartments and commercial buildings.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head />
      <body
        className={`${geist.variable} font-sans antialiased bg-white text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
