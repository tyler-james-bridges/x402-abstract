"use client";

import { useState } from "react";
import { formatAddress } from "@/lib/format";

interface AddressCellProps {
  address: string;
  href?: string;
}

export default function AddressCell({ address, href }: AddressCellProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const label = formatAddress(address);

  return (
    <span className="inline-flex items-center gap-1">
      {href ? (
        <a
          href={href}
          className="font-mono text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {label}
        </a>
      ) : (
        <span className="font-mono text-sm text-gray-300">{label}</span>
      )}
      <button
        onClick={handleCopy}
        title="Copy address"
        className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
      >
        {copied ? (
          <span className="text-xs text-green-400">Copied</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </span>
  );
}
