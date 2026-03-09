import { NextResponse } from "next/server";
import { fetchTransfers, computeStats } from "@/lib/transfers";

export async function GET() {
  const transfers = await fetchTransfers(200);
  const stats = computeStats(transfers);

  const totalVolumeUsd = (Number(stats.totalVolume) / 1_000_000).toFixed(2);

  return NextResponse.json(
    {
      totalTransfers: stats.totalCount,
      totalVolumeUsd,
      uniqueBuyers: stats.uniqueBuyers,
      uniqueSellers: stats.uniqueSellers,
      lastUpdated: Date.now(),
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
