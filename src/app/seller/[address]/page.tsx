import Link from "next/link";
import TransactionTable from "@/components/TransactionTable";
import TimeAgo from "@/components/TimeAgo";
import { recentTransfers, getSellerStats } from "@/lib/snapshot";
import { formatAddress } from "@/lib/format";

export default async function SellerPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  // All-time totals for this seller come from the persisted ledger, not
  // just whatever's in the rolling recent window — a seller who was active
  // back in March still shows their real history here.
  const sellerStats = getSellerStats(address);
  const stats = sellerStats ?? {
    address: address.toLowerCase(),
    txCount: 0,
    totalVolume: "0",
    uniqueBuyerCount: 0,
    lastActive: 0,
  };
  const sellerTransfers = recentTransfers.filter(
    (t) => t.to.toLowerCase() === address.toLowerCase(),
  );

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
            Transactions (all-time)
          </p>
          <p className="text-2xl font-bold text-text-primary">{stats.txCount.toLocaleString()}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            Volume (all-time)
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
            {stats.uniqueBuyerCount.toLocaleString()}
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            Last Active
          </p>
          <p className="text-2xl font-bold text-text-primary">
            {stats.lastActive ? <TimeAgo timestamp={stats.lastActive} /> : "—"}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Transaction History
        </h2>
        {stats.txCount > sellerTransfers.length && (
          <p className="text-sm text-text-secondary mb-3">
            Showing the {sellerTransfers.length.toLocaleString()} most recent transactions
            (last 30 days). This seller has {stats.txCount.toLocaleString()} total
            {sellerStats?.firstSeen ? (
              <>
                {" "}
                going back to <TimeAgo timestamp={sellerStats.firstSeen} />
              </>
            ) : null}
            .
          </p>
        )}
        <TransactionTable transfers={sellerTransfers} />
      </div>
    </div>
  );
}
