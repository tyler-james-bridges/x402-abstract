import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "x402 Abstract",
  description: "x402 payment explorer for Abstract L2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-gray-100 min-h-screen`}
      >
        <header className="border-b border-gray-800 bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-white font-bold text-xl tracking-tight">
                x402
              </span>
              <span className="text-gray-500 text-sm hidden sm:block">
                Abstract L2 Payment Explorer
              </span>
            </Link>
            <nav className="flex items-center gap-4">
              <a
                href="https://abscan.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-200 text-sm transition-colors"
              >
                Abscan
              </a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
