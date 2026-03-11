import { NextRequest, NextResponse } from "next/server";
import {
  fetchTransfers,
  computeStats,
  computeSellerStats,
  serializeTransfer,
  serializeSellerStats,
} from "@/lib/transfers";

const ACK_TIPS_URL = "https://ack-onchain.dev/api/tips/hashes";

async function fetchTipHashes(): Promise<Set<string>> {
  try {
    const res = await fetch(ACK_TIPS_URL, { next: { revalidate: 30 } });
    if (!res.ok) return new Set();
    const data = await res.json();
    return new Set((data.hashes as string[]).map((h) => h.toLowerCase()));
  } catch {
    return new Set();
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const seller = searchParams.get("seller") ?? undefined;

  const limit = Math.min(limitParam ? parseInt(limitParam, 10) : 50, 200);

  const [allTransfers, tipHashes] = await Promise.all([
    fetchTransfers(200),
    fetchTipHashes(),
  ]);

  // Supplement selector-based classification with tip hash registry
  for (const t of allTransfers) {
    if (tipHashes.has(t.hash.toLowerCase())) {
      t.paymentType = "tip";
    }
  }

  const stats = computeStats(allTransfers);
  const sellers = computeSellerStats(allTransfers);
  const transfers = seller
    ? allTransfers.filter((t) => t.to.toLowerCase() === seller.toLowerCase()).slice(0, limit)
    : allTransfers.slice(0, limit);

  return NextResponse.json(
    {
      transfers: transfers.map(serializeTransfer),
      stats: {
        totalCount: stats.totalCount,
        totalVolume: stats.totalVolume.toString(),
        uniqueBuyers: stats.uniqueBuyers,
        uniqueSellers: stats.uniqueSellers,
      },
      sellers: sellers.map(serializeSellerStats),
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
