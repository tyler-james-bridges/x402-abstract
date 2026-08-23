import { NextRequest, NextResponse } from "next/server";
import {
  recentTransfers,
  lastSyncedAt,
  getCumulativeStats,
  getAllTimeSellers,
  getFullDailyVolume,
  computeStats,
  computeSellerStats,
  filterByRange,
  type TimeRange,
  type DailyPoint,
} from "@/lib/snapshot";

const VALID_RANGES: TimeRange[] = ["24h", "7d", "30d", "all"];

function isTimeRange(value: string | null): value is TimeRange {
  return value !== null && (VALID_RANGES as string[]).includes(value);
}

function dailyVolumeFromRecent(transfers: { timestamp: number; value: string }[]): DailyPoint[] {
  const map = new Map<string, number>();
  for (const t of transfers) {
    const date = new Date(t.timestamp * 1000).toISOString().slice(0, 10);
    map.set(date, (map.get(date) ?? 0) + Number(BigInt(t.value)) / 1_000_000);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, volume]) => ({ date, volume }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rangeParam = searchParams.get("range");
  const range: TimeRange = isTimeRange(rangeParam) ? rangeParam : "all";
  const seller = searchParams.get("seller") ?? undefined;
  const limitParam = searchParams.get("limit");
  const limit = Math.min(limitParam ? parseInt(limitParam, 10) : 50, 200);

  const windowed = filterByRange(recentTransfers, range);
  const scoped = seller ? windowed.filter((t) => t.to.toLowerCase() === seller.toLowerCase()) : windowed;

  // "all" gets its stats/sellers from the unbounded cumulative ledger (exact
  // since inception) rather than the rolling window, which only covers the
  // last few weeks. The transaction list still comes from the rolling
  // window either way — nothing renders 36k+ rows in a table.
  const stats = range === "all" && !seller ? getCumulativeStats() : computeStats(scoped);
  const sellers = range === "all" && !seller ? getAllTimeSellers() : computeSellerStats(scoped);
  const dailyVolume = range === "all" ? getFullDailyVolume() : dailyVolumeFromRecent(scoped);

  return NextResponse.json(
    {
      range,
      lastSyncedAt,
      stats,
      sellers,
      dailyVolume,
      transfers: scoped.slice(0, limit),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
