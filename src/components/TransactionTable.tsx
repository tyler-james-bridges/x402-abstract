"use client";

import { useState } from "react";
import AddressCell from "./AddressCell";
import TimeAgo from "./TimeAgo";
import { formatUsd } from "@/lib/format";

interface SerializedTransfer {
  hash: string;
  blockNumber: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  paymentType: "tip" | "service";
}

const PAGE_SIZE = 10;

export default function TransactionTable({
  transfers,
}: {
  transfers: SerializedTransfer[];
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(transfers.length / PAGE_SIZE));
  const visible = transfers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (transfers.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-12 text-center">
        <p className="text-text-muted">No transactions found</p>
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
              <th className="text-center px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                Type
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider hidden md:table-cell">
                Buyer
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                TX Hash
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider hidden sm:table-cell">
                Time
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider hidden lg:table-cell">
                Chain
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((tx, i) => (
              <tr
                key={`${tx.hash}-${i}`}
                className="hover:bg-surface-hover transition-colors"
              >
                <td className="px-4 py-3">
                  <AddressCell address={tx.to} link={`/seller/${tx.to}`} />
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    tx.paymentType === "tip"
                      ? "bg-accent/15 text-accent"
                      : "bg-text-muted/15 text-text-secondary"
                  }`}>
                    {tx.paymentType === "tip" ? "Kudos" : "Service"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-medium text-sm text-text-primary">
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
                    className="font-mono text-sm text-accent hover:text-accent-dim hover:underline"
                  >
                    {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                  </a>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <TimeAgo timestamp={tx.timestamp} />
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-sm text-text-secondary">
            {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, transfers.length)} of {transfers.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-sm rounded-md border border-border text-text-secondary disabled:opacity-40 hover:bg-surface-hover transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-sm rounded-md border border-border text-text-secondary disabled:opacity-40 hover:bg-surface-hover transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
