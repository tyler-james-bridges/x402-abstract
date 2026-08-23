# data/x402-snapshot.json

The ledger of every x402 payment processed by the facilitator contract on
Abstract, kept in sync by `scripts/sync-snapshot.mjs` via the
`sync-x402-data` GitHub Action (every 30 minutes) and read by the app
through `src/lib/snapshot.ts`. The app never hits the chain live per
request anymore — see `src/lib/snapshot.ts` for why.

The file is minified JSON, not meant to be hand-edited. Shape:

```
{
  "lastSyncedBlock": number,
  "lastSyncedAt": string,        // ISO timestamp of the last sync run

  "cumulative": {                // exact, all-time, since block 0
    "totalCount": number,
    "totalVolume": string,       // raw USDC.e units (6 decimals), as a string
    "typeCounts": { "service": number, "tip": number },
    "buyers": string[]           // every buyer address ever seen, sorted
  },

  "sellers": {                   // exact, all-time, keyed by seller address
    "0x...": {
      "txCount": number,
      "totalVolume": string,
      "buyers": string[],        // that seller's unique buyers, sorted
      "firstSeen": number,       // unix seconds
      "lastActive": number
    }
  },

  "daily": {                     // count + volume per UTC day, since inception
    "YYYY-MM-DD": { "count": number, "volume": string }
  },

  "recent": [                    // rolling window (config/x402.json's
                                  // recentWindowDays, default 30), newest
                                  // first, stored as tuples to keep the
                                  // file size sane:
    ["hash", "blockNumber", "from", "to", "value", timestamp, "paymentType"]
  ]
}
```

Why `cumulative`/`sellers`/`daily` are unbounded but `recent` is a rolling
window: at ~1,000 tx/day, keeping full row-level detail forever isn't
worth the file size, but the aggregates cost almost nothing to keep
forever and are what make the "All time" stats actually true instead of
whatever the last N raw rows happened to show.

To regenerate from scratch, delete this file and run `pnpm sync` — it
walks the full chain history from block 0, which takes a few minutes.
