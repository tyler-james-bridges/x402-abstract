import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
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
    <header className="border-b border-border bg-surface sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-semibold text-text-primary text-lg">x402 <span className="text-accent">Abstract</span></Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-sm font-medium text-accent bg-accent/10 rounded-md"
            >
              Overview
            </Link>
            <a
              href="https://abscan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md transition-colors"
            >
              Abscan
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 rounded-full">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs font-medium text-accent">
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
    <footer className="border-t border-border bg-surface mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <span className="text-sm text-text-muted">x402 Abstract Explorer</span>
        <div className="flex items-center gap-4">
          <a
            href="https://abscan.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Abscan
          </a>
          <a
            href="https://x402.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t){document.documentElement.setAttribute('data-theme',t)}else if(window.matchMedia('(prefers-color-scheme:light)').matches){document.documentElement.setAttribute('data-theme','light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-page text-text-primary min-h-screen`}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
