"use client";

import AddressCell from "./AddressCell";
import { formatUsd, timeAgo } from "@/lib/format";

interface SerializedTransfer {
  hash: string;
  blockNumber: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

export default function TransactionTable({
  transfers,
}: {
  transfers: SerializedTransfer[];
}) {
  if (transfers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Seller
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Buyer
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                TX Hash
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Time
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                Chain
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {transfers.map((tx, i) => (
              <tr
                key={`${tx.hash}-${i}`}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <AddressCell address={tx.to} link={`/seller/${tx.to}`} />
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {formatUsd(BigInt(tx.value))}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <AddressCell address={tx.from} />
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`https://abscan.org/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline"
                  >
                    {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                  </a>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {timeAgo(tx.timestamp)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center hidden lg:table-cell">
                  <div className="inline-flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Abstract</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
