"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/format";

export default function TimeAgo({ timestamp }: { timestamp: number }) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    setDisplay(timeAgo(timestamp));
    const interval = setInterval(() => setDisplay(timeAgo(timestamp)), 30000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return <span className="text-sm text-text-secondary">{display}</span>;
}
