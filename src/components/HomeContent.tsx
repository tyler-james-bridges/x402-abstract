"use client";

import { useEffect, useState } from "react";
import StatsBar from "./StatsBar";
import TransactionTable from "./TransactionTable";
import SellerTable from "./SellerTable";

interface SerializedTransfer {
  hash: string;
  blockNumber: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
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

interface HomeContentProps {
  initialTransfers: SerializedTransfer[];
  initialStats: SerializedStats;
  initialSellers: SerializedSellerStats[];
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
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default function HomeContent({
  initialTransfers,
  initialStats,
  initialSellers,
}: HomeContentProps) {
  const [transfers, setTransfers] = useState(initialTransfers);
  const [stats, setStats] = useState(initialStats);
  const [sellers, setSellers] = useState(initialSellers);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/transfers?limit=50");
        if (!res.ok) return;
        const data = await res.json();
        setTransfers(data.transfers);
        setStats(data.stats);
        setSellers(data.sellers);
      } catch {
        /* silent refresh failure */
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">x402 on Abstract</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time x402 payment activity on Abstract L2
          </p>
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
          title="Top Sellers"
          description="Addresses receiving x402 payments on Abstract"
        />
        <SellerTable sellers={sellers} />
      </div>

      <div>
        <SectionHeader
          title="Recent Transactions"
          description="x402 USDC.e transfers on Abstract L2"
        />
        <TransactionTable transfers={transfers} />
      </div>
    </div>
  );
}
