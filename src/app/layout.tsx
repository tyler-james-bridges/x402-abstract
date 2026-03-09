import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "x402 Abstract | Payment Explorer",
  description: "The x402 payment explorer for Abstract L2",
};

function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">x4</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg">
                x402<span className="text-blue-600">Abstract</span>
              </span>
            </Link>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md"
            >
              Overview
            </Link>
            <a
              href="https://abscan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              Abscan
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-full">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-xs font-medium text-purple-700">
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
    <footer className="border-t border-gray-200 bg-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-[8px]">x4</span>
          </div>
          <span className="text-sm text-gray-500">x402 Abstract Explorer</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://abscan.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Abscan
          </a>
          <a
            href="https://x402.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
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
      <body className="antialiased bg-gray-50 min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
