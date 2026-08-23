// Reads data/x402-snapshot.json — a periodically-updated ledger of every
// x402 payment through the Abstract facilitator, kept in sync by
// scripts/sync-snapshot.mjs via a scheduled GitHub Action (see
// .github/workflows/sync-x402-data.yml). Bundled at build time, so a fresh
// Vercel deploy is what actually picks up new data; there is no live
// chain-scanning per request anymore.
//
// Why a snapshot instead of live RPC calls: this facilitator now processes
// on the order of 1,000 payments/day (it was near-zero when this app was
// first built). Re-walking full history on every request isn't feasible,
// and a single "last 200 raw txs" fetch — the old approach — represents a
// few hours of data at that pace, not the totals it was labeled as.
import snapshotData from "../../data/x402-snapshot.json";

export type PaymentType = "service" | "tip";

export interface SerializedTransfer {
  hash: string;
  blockNumber: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  paymentType: PaymentType;
}

export interface SerializedStats {
  totalCount: number;
  totalVolume: string;
  uniqueBuyers: number;
  uniqueSellers: number;
}

export interface SerializedSellerStats {
  address: string;
  txCount: number;
  totalVolume: string;
  uniqueBuyerCount: number;
  lastActive: number;
  firstSeen?: number;
}

export interface DailyPoint {
  date: string;
  volume: number;
}

type RecentTuple = [string, string, string, string, string, number, PaymentType];

const RECENT_FIELDS = ["hash", "blockNumber", "from", "to", "value", "timestamp", "paymentType"] as const;

function tupleToTransfer(t: RecentTuple): SerializedTransfer {
  return Object.fromEntries(RECENT_FIELDS.map((k, i) => [k, t[i]])) as unknown as SerializedTransfer;
}

interface SnapshotShape {
  lastSyncedBlock: number;
  lastSyncedAt: string | null;
  cumulative: {
    totalCount: number;
    totalVolume: string;
    typeCounts: Record<string, number>;
    buyers: string[];
  };
  sellers: Record<
    string,
    { txCount: number; totalVolume: string; buyers: string[]; firstSeen: number; lastActive: number }
  >;
  daily: Record<string, { count: number; volume: string }>;
  recent: RecentTuple[];
}

const snapshot = snapshotData as unknown as SnapshotShape;

/** Full rolling window (see config/x402.json's recentWindowDays), newest first. */
export const recentTransfers: SerializedTransfer[] = snapshot.recent.map(tupleToTransfer);

export const lastSyncedAt: string | null = snapshot.lastSyncedAt;

/** True all-time totals, exact regardless of how far back the rolling window reaches. */
export function getCumulativeStats(): SerializedStats {
  return {
    totalCount: snapshot.cumulative.totalCount,
    totalVolume: snapshot.cumulative.totalVolume,
    uniqueBuyers: snapshot.cumulative.buyers.length,
    uniqueSellers: Object.keys(snapshot.sellers).length,
  };
}

/** True all-time per-seller stats, sorted by transaction count descending. */
export function getAllTimeSellers(): SerializedSellerStats[] {
  return Object.entries(snapshot.sellers)
    .map(([address, s]) => ({
      address,
      txCount: s.txCount,
      totalVolume: s.totalVolume,
      uniqueBuyerCount: s.buyers.length,
      lastActive: s.lastActive,
    }))
    .sort((a, b) => b.txCount - a.txCount);
}

export function getSellerStats(address: string): SerializedSellerStats | null {
  const s = snapshot.sellers[address.toLowerCase()];
  if (!s) return null;
  return {
    address: address.toLowerCase(),
    txCount: s.txCount,
    totalVolume: s.totalVolume,
    uniqueBuyerCount: s.buyers.length,
    lastActive: s.lastActive,
    firstSeen: s.firstSeen,
  };
}

/** Full daily volume history since inception (for the "all" range chart). */
export function getFullDailyVolume(): DailyPoint[] {
  return Object.entries(snapshot.daily)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({ date, volume: Number(d.volume) / 1_000_000 }));
}

export function computeStats(transfers: SerializedTransfer[]): SerializedStats {
  const buyers = new Set<string>();
  const sellers = new Set<string>();
  let totalVolume = 0n;
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

export function computeSellerStats(transfers: SerializedTransfer[]): SerializedSellerStats[] {
  const map = new Map<
    string,
    { address: string; txCount: number; totalVolume: bigint; buyers: Set<string>; lastActive: number }
  >();
  for (const t of transfers) {
    const key = t.to.toLowerCase();
    if (!map.has(key)) {
      map.set(key, { address: t.to, txCount: 0, totalVolume: 0n, buyers: new Set(), lastActive: 0 });
    }
    const entry = map.get(key)!;
    entry.txCount += 1;
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

export type TimeRange = "24h" | "7d" | "30d" | "all";

export function rangeCutoffSeconds(range: TimeRange): number | null {
  if (range === "all") return null;
  const now = Math.floor(Date.now() / 1000);
  if (range === "24h") return now - 86400;
  if (range === "7d") return now - 604800;
  return now - 2592000; // 30d
}

export function filterByRange(transfers: SerializedTransfer[], range: TimeRange): SerializedTransfer[] {
  const cutoff = rangeCutoffSeconds(range);
  if (cutoff === null) return transfers;
  return transfers.filter((t) => t.timestamp >= cutoff);
}
