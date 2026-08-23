"use client";

const MAX_BARS = 60;

export interface DailyVolumePoint {
  date: string; // "YYYY-MM-DD"
  volume: number;
}

interface VolumeChartProps {
  daily: DailyVolumePoint[];
}

function toBars(daily: DailyVolumePoint[]): { label: string; volume: number }[] {
  // `daily` only ever grows (one entry per day since inception), so cap how
  // far back the chart reaches rather than rendering an ever-widening row
  // of bars.
  const recent = daily.slice(-MAX_BARS);
  return recent.map(({ date, volume }) => {
    const [, month, day] = date.split("-");
    return { label: `${Number(month)}/${Number(day)}`, volume };
  });
}

export default function VolumeChart({ daily }: VolumeChartProps) {
  const days = toBars(daily);

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
