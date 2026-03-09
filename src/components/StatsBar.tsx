import { formatUsd } from "@/lib/format";

interface StatsBarProps {
  stats: {
    totalCount: number;
    totalVolume: bigint;
    uniqueBuyers: number;
    uniqueSellers: number;
  };
}

export default function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: "Total Transfers", value: stats.totalCount.toLocaleString() },
    { label: "Total Volume", value: formatUsd(stats.totalVolume) },
    { label: "Unique Buyers", value: stats.uniqueBuyers.toLocaleString() },
    { label: "Unique Sellers", value: stats.uniqueSellers.toLocaleString() },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-gray-900 rounded-lg p-4 border border-gray-800"
        >
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
            {item.label}
          </p>
          <p className="text-white text-2xl font-bold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
