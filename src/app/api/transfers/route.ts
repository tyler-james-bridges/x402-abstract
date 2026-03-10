import { NextRequest, NextResponse } from "next/server";
import {
  fetchTransfers,
  computeStats,
  computeSellerStats,
  serializeTransfer,
  serializeSellerStats,
} from "@/lib/transfers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const seller = searchParams.get("seller") ?? undefined;

  const limit = Math.min(limitParam ? parseInt(limitParam, 10) : 50, 200);

  const transfers = await fetchTransfers(limit, seller);
  const stats = computeStats(transfers);
  const sellers = computeSellerStats(transfers);

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
