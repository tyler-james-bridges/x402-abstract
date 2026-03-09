interface StatsBarProps {
  totalCount: number;
  totalVolume: string;
  uniqueBuyers: number;
  uniqueSellers: number;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function StatsBar({
  totalCount,
  totalVolume,
  uniqueBuyers,
  uniqueSellers,
}: StatsBarProps) {
  const vol = parseFloat(totalVolume);
  const formattedVolume =
    vol >= 1000 ? `$${(vol / 1000).toFixed(2)}K` : `$${vol.toFixed(2)}`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Transactions" value={totalCount.toLocaleString()} />
      <StatCard label="Volume" value={formattedVolume} />
      <StatCard label="Buyers" value={uniqueBuyers.toLocaleString()} />
      <StatCard label="Sellers" value={uniqueSellers.toLocaleString()} />
    </div>
  );
}
