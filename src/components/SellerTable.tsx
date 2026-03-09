"use client";

import AddressCell from "./AddressCell";
import { formatUsd, timeAgo } from "@/lib/format";

interface SerializedSellerStats {
  address: string;
  txCount: number;
  totalVolume: string;
  uniqueBuyerCount: number;
  lastActive: number;
}

export default function SellerTable({
  sellers,
}: {
  sellers: SerializedSellerStats[];
}) {
  if (sellers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No sellers found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seller
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Txns
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volume
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Buyers
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Last Active
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Chain
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sellers.map((seller) => (
              <tr
                key={seller.address}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0" />
                    <AddressCell
                      address={seller.address}
                      link={`/seller/${seller.address}`}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {seller.txCount.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {formatUsd(BigInt(seller.totalVolume))}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className="text-sm text-gray-600">
                    {seller.uniqueBuyerCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <span className="text-sm text-gray-500">
                    {timeAgo(seller.lastActive)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center hidden lg:table-cell">
                  <div className="inline-flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-purple-500" />
                    <span className="text-xs text-gray-500">Abstract</span>
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
