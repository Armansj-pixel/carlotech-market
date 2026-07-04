import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import ThreeBackground from "@/components/ThreeBackground";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Carlo Tech Store — Akses Premium, Diaktifkan Cepat",
  description:
    "Marketplace langganan aplikasi premium: streaming, tools kreator, dan lainnya. Order, bayar, aktif.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} font-body bg-ink text-text`}
      >
        <ThreeBackground />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
