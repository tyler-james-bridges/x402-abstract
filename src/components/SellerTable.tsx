"use client";

import AddressCell from "./AddressCell";
import TimeAgo from "./TimeAgo";
import { formatUsd } from "@/lib/format";

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
      <div className="bg-surface rounded-xl border border-border p-12 text-center">
        <p className="text-text-muted">No sellers found</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-hover border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                Seller
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                Txns
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                Volume
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider hidden sm:table-cell">
                Buyers
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider hidden md:table-cell">
                Last Active
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider hidden lg:table-cell">
                Chain
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sellers.map((seller) => (
              <tr
                key={seller.address}
                className="hover:bg-surface-hover transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-accent-dim flex-shrink-0" />
                    <AddressCell
                      address={seller.address}
                      link={`/seller/${seller.address}`}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-text-primary">
                    {seller.txCount.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-text-primary">
                    {formatUsd(BigInt(seller.totalVolume))}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className="text-sm text-text-secondary">
                    {seller.uniqueBuyerCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <TimeAgo timestamp={seller.lastActive} />
                </td>
                <td className="px-4 py-3 text-center hidden lg:table-cell">
                  <div className="inline-flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-accent" />
                    <span className="text-xs text-text-secondary">Abstract</span>
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
