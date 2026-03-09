"use client";

import { formatUsd, timeAgo } from "@/lib/format";
import { SerializedSellerStats } from "@/lib/transfers";
import AddressCell from "./AddressCell";

interface SellerTableProps {
  sellers: SerializedSellerStats[];
}

export default function SellerTable({ sellers }: SellerTableProps) {
  if (sellers.length === 0) {
    return (
      <div className="text-gray-400 text-sm py-8 text-center">
        No sellers found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-900 border-b border-gray-800">
          <tr>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">
              Address
            </th>
            <th className="text-right px-4 py-3 text-gray-400 font-medium">
              Transactions
            </th>
            <th className="text-right px-4 py-3 text-gray-400 font-medium">
              Volume
            </th>
            <th className="text-right px-4 py-3 text-gray-400 font-medium hidden md:table-cell">
              Unique Buyers
            </th>
            <th className="text-right px-4 py-3 text-gray-400 font-medium hidden md:table-cell">
              Last Active
            </th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((s, i) => (
            <tr
              key={s.address}
              className={i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"}
            >
              <td className="px-4 py-3">
                <AddressCell
                  address={s.address}
                  href={`/seller/${s.address}`}
                />
              </td>
              <td className="px-4 py-3 text-right text-white font-mono">
                {s.txCount.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right text-green-400 font-mono">
                {formatUsd(BigInt(s.totalVolume))}
              </td>
              <td className="px-4 py-3 text-right text-gray-300 hidden md:table-cell">
                {s.uniqueBuyerCount.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right text-gray-400 whitespace-nowrap hidden md:table-cell">
                {timeAgo(s.lastActive)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
