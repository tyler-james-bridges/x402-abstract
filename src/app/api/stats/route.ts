import { NextResponse } from "next/server";
import { getCumulativeStats, lastSyncedAt } from "@/lib/snapshot";

// All-time totals, sourced from data/x402-snapshot.json (kept current by
// the sync-x402-data GitHub Action). `lastUpdated` reflects when that
// snapshot was last synced, not this request's time.
export async function GET() {
  const stats = getCumulativeStats();
  const totalVolumeUsd = (Number(stats.totalVolume) / 1_000_000).toFixed(2);

  return NextResponse.json(
    {
      totalTransfers: stats.totalCount,
      totalVolumeUsd,
      uniqueBuyers: stats.uniqueBuyers,
      uniqueSellers: stats.uniqueSellers,
      lastUpdated: lastSyncedAt,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
