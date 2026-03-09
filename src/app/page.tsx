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
  const transfers = await fetchTransfers();
  const stats = computeStats(transfers);
  const sellers = computeSellerStats(transfers);

  return (
    <HomeContent
      initialTransfers={transfers.map(serializeTransfer)}
      initialStats={serializeStats(stats)}
      initialSellers={sellers.map(serializeSellerStats)}
    />
  );
}
