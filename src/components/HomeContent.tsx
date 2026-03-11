"use client";

import { useEffect, useState, useMemo } from "react";
import StatsBar from "./StatsBar";
import VolumeChart from "./VolumeChart";
import TransactionTable from "./TransactionTable";
import SellerTable from "./SellerTable";

interface SerializedTransfer {
  hash: string;
  blockNumber: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  paymentType: "tip" | "service";
}

interface SerializedStats {
  totalCount: number;
  totalVolume: string;
  uniqueBuyers: number;
  uniqueSellers: number;
}

interface SerializedSellerStats {
  address: string;
  txCount: number;
  totalVolume: string;
  uniqueBuyerCount: number;
  lastActive: number;
}

type TimeRange = "24h" | "7d" | "30d" | "all";

const RANGE_LABELS: Record<TimeRange, string> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
  all: "All",
};

function filterByRange(transfers: SerializedTransfer[], range: TimeRange) {
  if (range === "all") return transfers;
  const now = Math.floor(Date.now() / 1000);
  const cutoff =
    range === "24h" ? now - 86400 : range === "7d" ? now - 604800 : now - 2592000;
  return transfers.filter((t) => t.timestamp >= cutoff);
}

function computeClientStats(transfers: SerializedTransfer[]): SerializedStats {
  const buyers = new Set<string>();
  const sellers = new Set<string>();
  let totalVolume = BigInt(0);
  for (const t of transfers) {
    buyers.add(t.from.toLowerCase());
    sellers.add(t.to.toLowerCase());
    totalVolume += BigInt(t.value);
  }
  return {
    totalCount: transfers.length,
    totalVolume: totalVolume.toString(),
    uniqueBuyers: buyers.size,
    uniqueSellers: sellers.size,
  };
}

function computeClientSellers(transfers: SerializedTransfer[]): SerializedSellerStats[] {
  const map = new Map<string, { txCount: number; totalVolume: bigint; buyers: Set<string>; lastActive: number; address: string }>();
  for (const t of transfers) {
    const key = t.to.toLowerCase();
    if (!map.has(key)) {
      map.set(key, { address: t.to, txCount: 0, totalVolume: BigInt(0), buyers: new Set(), lastActive: 0 });
    }
    const entry = map.get(key)!;
    entry.txCount++;
    entry.totalVolume += BigInt(t.value);
    entry.buyers.add(t.from.toLowerCase());
    if (t.timestamp > entry.lastActive) entry.lastActive = t.timestamp;
  }
  return [...map.values()]
    .sort((a, b) => b.txCount - a.txCount)
    .map((s) => ({
      address: s.address,
      txCount: s.txCount,
      totalVolume: s.totalVolume.toString(),
      uniqueBuyerCount: s.buyers.size,
      lastActive: s.lastActive,
    }));
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="text-sm text-text-secondary mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-48 bg-surface-hover rounded mb-2" />
        <div className="h-4 w-72 bg-surface-hover rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-5 h-20" />
        ))}
      </div>
      <div className="bg-surface rounded-xl border border-border h-48" />
    </div>
  );
}

export default function HomeContent() {
  const [allTransfers, setAllTransfers] = useState<SerializedTransfer[] | null>(null);
  const [range, setRange] = useState<TimeRange>("all");

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch("/api/transfers?limit=200");
        if (!res.ok) return;
        const data = await res.json();
        setAllTransfers(data.transfers);
      } catch {
        /* silent refresh failure */
      }
    };
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(
    () => (allTransfers ? filterByRange(allTransfers, range) : []),
    [allTransfers, range],
  );
  const stats = useMemo(() => computeClientStats(filtered), [filtered]);
  const sellers = useMemo(() => computeClientSellers(filtered), [filtered]);

  if (!allTransfers) return <LoadingSkeleton />;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">x402 on Abstract</h1>
            <p className="text-sm text-text-secondary mt-1">
              Real-time x402 payment activity on Abstract L2
            </p>
          </div>
          <div className="flex items-center gap-1 bg-surface-hover rounded-lg p-1">
            {(Object.keys(RANGE_LABELS) as TimeRange[]).map((key) => (
              <button
                key={key}
                onClick={() => setRange(key)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  range === key
                    ? "bg-surface text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {RANGE_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
        <StatsBar
          totalCount={stats.totalCount}
          totalVolume={stats.totalVolume}
          uniqueBuyers={stats.uniqueBuyers}
          uniqueSellers={stats.uniqueSellers}
        />
      </div>

      <div>
        <SectionHeader
          title="Recent Transactions"
          description="x402 USDC.e transfers on Abstract L2"
        />
        <TransactionTable transfers={filtered} />
      </div>

      <VolumeChart transfers={filtered} />

      <div>
        <SectionHeader
          title="Top Sellers"
          description="Addresses receiving x402 payments on Abstract"
        />
        <SellerTable sellers={sellers} />
      </div>
    </div>
  );
}
