"use client";

import { formatUsd, timeAgo } from "@/lib/format";
import { SerializedTransfer } from "@/lib/transfers";
import AddressCell from "./AddressCell";

interface TransactionTableProps {
  transfers: SerializedTransfer[];
}

export default function TransactionTable({ transfers }: TransactionTableProps) {
  if (transfers.length === 0) {
    return (
      <div className="text-gray-400 text-sm py-8 text-center">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-900 border-b border-gray-800">
          <tr>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">
              Seller
            </th>
            <th className="text-right px-4 py-3 text-gray-400 font-medium">
              Amount
            </th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">
              Buyer
            </th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">
              TX Hash
            </th>
            <th className="text-right px-4 py-3 text-gray-400 font-medium">
              Time
            </th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t, i) => (
            <tr
              key={`${t.hash}-${i}`}
              className={i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"}
            >
              <td className="px-4 py-3">
                <AddressCell address={t.to} href={`/seller/${t.to}`} />
              </td>
              <td className="px-4 py-3 text-right text-green-400 font-mono">
                {formatUsd(BigInt(t.value))}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <AddressCell address={t.from} />
              </td>
              <td className="px-4 py-3">
                <a
                  href={`https://abscan.org/tx/${t.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {`${t.hash.slice(0, 8)}...`}
                </a>
              </td>
              <td className="px-4 py-3 text-right text-gray-400 whitespace-nowrap">
                {timeAgo(t.timestamp)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
