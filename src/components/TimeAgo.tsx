"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/format";

export default function TimeAgo({ timestamp }: { timestamp: number }) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    const tick = () => setDisplay(timeAgo(timestamp));
    const immediate = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 30000);
    return () => {
      window.clearTimeout(immediate);
      window.clearInterval(interval);
    };
  }, [timestamp]);

  return <span className="text-sm text-text-secondary">{display}</span>;
}
