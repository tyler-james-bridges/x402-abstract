import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "x402 Abstract | Payment Explorer",
  description: "The x402 payment explorer for Abstract L2",
};

function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">x4</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                x402<span className="text-green-600 dark:text-green-400">Abstract</span>
              </span>
            </Link>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 rounded-md"
            >
              Overview
            </Link>
            <a
              href="https://abscan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              Abscan
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-950 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                Abstract
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-green-600 flex items-center justify-center">
            <span className="text-white font-bold text-[8px]">x4</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">x402 Abstract Explorer</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://abscan.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Abscan
          </a>
          <a
            href="https://x402.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            x402
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen`}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
