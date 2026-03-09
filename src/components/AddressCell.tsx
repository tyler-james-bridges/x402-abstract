"use client";

import { formatAddress } from "@/lib/format";
import { useState } from "react";

export default function AddressCell({
  address,
  link,
}: {
  address: string;
  link?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const display = formatAddress(address);

  const content = (
    <span className="font-mono text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
      {display}
    </span>
  );

  return (
    <span className="inline-flex items-center gap-1.5 group">
      {link ? (
        <a href={link} className="hover:underline">
          {content}
        </a>
      ) : (
        content
      )}
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
        title="Copy address"
      >
        {copied ? (
          <svg
            className="w-3.5 h-3.5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    </span>
  );
}
