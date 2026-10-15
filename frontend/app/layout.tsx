import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollAnimations from "@/components/animations/ScrollAnimations";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Function: metadata
 * Executes the core operations and logic for metadata.
 */
export const metadata: Metadata = {
  title: "NIRA - Premium Matrimony",
  description: "A modern, inclusive matrimony platform built for serious connections.",
};

/**
 * Component: RootLayout
 * Renders the UI and handles the internal logic for the Root Layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScrollAnimations />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
