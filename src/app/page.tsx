import HomeContent from "@/components/HomeContent";
import {
  fetchTransfers,
  computeStats,
  computeSellerStats,
  serializeTransfer,
  serializeSellerStats,
  serializeStats,
} from "@/lib/transfers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allTransfers = await fetchTransfers(200);
  const stats = computeStats(allTransfers);
  const sellers = computeSellerStats(allTransfers);

  return (
    <HomeContent
      initialTransfers={allTransfers.slice(0, 50).map(serializeTransfer)}
      initialStats={serializeStats(stats)}
      initialSellers={sellers.map(serializeSellerStats)}
    />
  );
}
