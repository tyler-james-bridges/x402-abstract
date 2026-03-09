import {
  fetchTransfers,
  computeStats,
  computeSellerStats,
  serializeTransfer,
  serializeStats,
  serializeSellerStats,
} from "@/lib/transfers";
import HomeContent from "@/components/HomeContent";

export default async function HomePage() {
  const transfers = await fetchTransfers(50);
  const allTransfers = await fetchTransfers(200);
  const stats = computeStats(transfers);
  const sellers = computeSellerStats(allTransfers);

  const serializedTransfers = transfers.map(serializeTransfer);
  const serializedStats = serializeStats(stats);
  const serializedSellers = sellers.map(serializeSellerStats);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <HomeContent
        initialTransfers={serializedTransfers}
        initialStats={serializedStats}
        initialSellers={serializedSellers}
      />
    </main>
  );
}
