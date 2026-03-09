"use client";

import { useEffect, useState } from "react";
import StatsBar from "./StatsBar";
import TransactionTable from "./TransactionTable";
import SellerTable from "./SellerTable";
import {
  SerializedTransfer,
  SerializedStats,
  SerializedSellerStats,
} from "@/lib/transfers";

interface HomeContentProps {
  initialTransfers: SerializedTransfer[];
  initialStats: SerializedStats;
  initialSellers: SerializedSellerStats[];
}

export default function HomeContent({
  initialTransfers,
  initialStats,
  initialSellers,
}: HomeContentProps) {
  const [transfers, setTransfers] = useState(initialTransfers);
  const [stats, setStats] = useState(initialStats);
  const [sellers] = useState(initialSellers);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/transfers?limit=50");
        if (!res.ok) return;
        const data = await res.json();
        setTransfers(data.transfers);
        setStats(data.stats);
      } catch {
        // silently ignore refresh errors
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  const statsForBar = {
    totalCount: stats.totalCount,
    totalVolume: BigInt(stats.totalVolume),
    uniqueBuyers: stats.uniqueBuyers,
    uniqueSellers: stats.uniqueSellers,
  };

  return (
    <>
      <StatsBar stats={statsForBar} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            Recent Transactions
          </h2>
          <TransactionTable transfers={transfers} />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Top Sellers</h2>
          <SellerTable sellers={sellers} />
        </section>
      </div>
    </>
  );
}
