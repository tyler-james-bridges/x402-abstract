import Link from "next/link";
import {
  fetchTransfers,
  computeStats,
  serializeTransfer,
} from "@/lib/transfers";
import { formatAddress, formatUsd } from "@/lib/format";
import TransactionTable from "@/components/TransactionTable";

interface SellerPageProps {
  params: Promise<{ address: string }>;
}

export default async function SellerPage({ params }: SellerPageProps) {
  const { address } = await params;

  const transfers = await fetchTransfers(200, address);
  const stats = computeStats(transfers);
  const serializedTransfers = transfers.map(serializeTransfer);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          Back to Explorer
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-white font-mono break-all">
          {address}
        </h1>
        <p className="text-gray-400 text-sm mt-1">Seller address</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
            Transactions
          </p>
          <p className="text-white text-2xl font-bold">
            {stats.totalCount.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
            Total Volume
          </p>
          <p className="text-white text-2xl font-bold">
            {formatUsd(stats.totalVolume)}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
            Unique Buyers
          </p>
          <p className="text-white text-2xl font-bold">
            {stats.uniqueBuyers.toLocaleString()}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">
          Transactions for {formatAddress(address)}
        </h2>
        {serializedTransfers.length === 0 ? (
          <div className="text-gray-400 text-sm py-8 text-center bg-gray-900 rounded-lg border border-gray-800">
            No transactions found in the last 2000 blocks.
          </div>
        ) : (
          <TransactionTable transfers={serializedTransfers} />
        )}
      </section>
    </main>
  );
}
