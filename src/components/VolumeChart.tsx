"use client";

interface SerializedTransfer {
  value: string;
  timestamp: number;
}

interface VolumeChartProps {
  transfers: SerializedTransfer[];
}

function groupByDay(transfers: SerializedTransfer[]): { label: string; volume: number }[] {
  const map = new Map<string, number>();

  for (const t of transfers) {
    const date = new Date(t.timestamp * 1000);
    const key = `${date.getMonth() + 1}/${date.getDate()}`;
    map.set(key, (map.get(key) ?? 0) + Number(BigInt(t.value)) / 1_000_000);
  }

  return [...map.entries()]
    .map(([label, volume]) => ({ label, volume }))
    .reverse();
}

export default function VolumeChart({ transfers }: VolumeChartProps) {
  const days = groupByDay(transfers);

  if (days.length === 0) return null;

  const max = Math.max(...days.map((d) => d.volume), 0.01);

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">
        Daily Volume
      </h3>
      <div className="flex items-end gap-1 h-32">
        {days.map((day) => (
          <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col items-center justify-end h-24">
              <div
                className="w-full max-w-[32px] bg-accent/80 rounded-t"
                style={{ height: `${Math.max((day.volume / max) * 100, 4)}%` }}
                title={`$${day.volume.toFixed(2)}`}
              />
            </div>
            <span className="text-[10px] text-text-muted">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
