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
  const allTransfers = await fetchTransfers(200);
  const sellerTransfers = allTransfers.filter(
    (t) => t.to.toLowerCase() === address.toLowerCase(),
  );
  const stats = serializeStats(computeStats(sellerTransfers));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-sm text-accent hover:text-accent-dim hover:underline mb-2 inline-block"
        >
          Back to overview
        </Link>
        <div className="flex items-center gap-3 mt-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-dim" />
          <div>
            <h1 className="text-xl font-bold text-text-primary font-mono">
              {formatAddress(address)}
            </h1>
            <p className="text-sm text-text-secondary">Seller on Abstract</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            Transactions
          </p>
          <p className="text-2xl font-bold text-text-primary">{stats.totalCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            Volume
          </p>
          <p className="text-2xl font-bold text-text-primary">
            ${(parseFloat(stats.totalVolume) / 1_000_000).toFixed(2)}
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            Unique Buyers
          </p>
          <p className="text-2xl font-bold text-text-primary">
            {stats.uniqueBuyers}
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            Unique Sellers
          </p>
          <p className="text-2xl font-bold text-text-primary">
            {stats.uniqueSellers}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Transaction History
        </h2>
        <TransactionTable transfers={sellerTransfers.map(serializeTransfer)} />
      </div>
    </div>
  );
}
