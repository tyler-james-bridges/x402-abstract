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
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline mb-2 inline-block"
        >
          Back to overview
        </Link>
        <div className="flex items-center gap-3 mt-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">
              {formatAddress(address)}
            </h1>
            <p className="text-sm text-gray-500">Seller on Abstract</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Transactions
          </p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Volume
          </p>
          <p className="text-2xl font-bold text-gray-900">
            ${parseFloat(stats.totalVolume).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Unique Buyers
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.uniqueBuyers}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Unique Sellers
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.uniqueSellers}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Transaction History
        </h2>
        <TransactionTable transfers={sellerTransfers.map(serializeTransfer)} />
      </div>
    </div>
  );
}
