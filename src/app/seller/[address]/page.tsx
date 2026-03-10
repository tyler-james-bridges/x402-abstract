import Link from "next/link";
import TransactionTable from "@/components/TransactionTable";
import {
  fetchTransfers,
  computeStats,
  serializeTransfer,
  serializeStats,
} from "@/lib/transfers";
import { formatAddress } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SellerPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  const allTransfers = await fetchTransfers();
  const sellerTransfers = allTransfers.filter(
    (t) => t.to.toLowerCase() === address.toLowerCase(),
  );
  const stats = serializeStats(computeStats(sellerTransfers));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline mb-2 inline-block"
        >
          Back to overview
        </Link>
        <div className="flex items-center gap-3 mt-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-mono">
              {formatAddress(address)}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Seller on Abstract</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Transactions
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Volume
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${(parseFloat(stats.totalVolume) / 1_000_000).toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Unique Buyers
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.uniqueBuyers}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Unique Sellers
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.uniqueSellers}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Transaction History
        </h2>
        <TransactionTable transfers={sellerTransfers.map(serializeTransfer)} />
      </div>
    </div>
  );
}
