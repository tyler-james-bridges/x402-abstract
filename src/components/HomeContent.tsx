"use client";

import { useEffect, useState } from "react";
import StatsBar from "./StatsBar";
import VolumeChart, { type DailyVolumePoint } from "./VolumeChart";
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

interface TransfersResponse {
  range: TimeRange;
  lastSyncedAt: string | null;
  stats: SerializedStats;
  sellers: SerializedSellerStats[];
  dailyVolume: DailyVolumePoint[];
  transfers: SerializedTransfer[];
}

type TimeRange = "24h" | "7d" | "30d" | "all";

const RANGE_LABELS: Record<TimeRange, string> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
  all: "All",
};

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

function formatSyncedAt(iso: string | null): string {
  if (!iso) return "never";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function HomeContent() {
  const [data, setData] = useState<TransfersResponse | null>(null);
  const [range, setRange] = useState<TimeRange>("all");

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const res = await fetch(`/api/transfers?range=${range}&limit=200`);
        if (!res.ok || cancelled) return;
        const json: TransfersResponse = await res.json();
        if (!cancelled) setData(json);
      } catch {
        /* silent refresh failure */
      }
    };
    refresh();
    // Data only changes when the sync-x402-data GitHub Action commits and
    // Vercel redeploys (every 30 min), so this just catches that without
    // requiring a manual reload — not a live chain poll.
    const interval = setInterval(refresh, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [range]);

  if (!data) return <LoadingSkeleton />;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">x402 on Abstract</h1>
            <p className="text-sm text-text-secondary mt-1">
              x402 payment activity on Abstract L2 · synced {formatSyncedAt(data.lastSyncedAt)}
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
          totalCount={data.stats.totalCount}
          totalVolume={data.stats.totalVolume}
          uniqueBuyers={data.stats.uniqueBuyers}
          uniqueSellers={data.stats.uniqueSellers}
        />
      </div>

      <div>
        <SectionHeader
          title="Recent Transactions"
          description={
            range === "all"
              ? "Most recent x402 USDC.e transfers (stats above cover all-time)"
              : "x402 USDC.e transfers on Abstract L2"
          }
        />
        <TransactionTable transfers={data.transfers} />
      </div>

      <VolumeChart daily={data.dailyVolume} />

      <div>
        <SectionHeader
          title="Top Sellers"
          description="Addresses receiving x402 payments on Abstract"
        />
        <SellerTable sellers={data.sellers} />
      </div>
    </div>
  );
}
