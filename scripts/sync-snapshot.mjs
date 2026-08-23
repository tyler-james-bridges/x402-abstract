#!/usr/bin/env node
// Incrementally walks the x402 facilitator contract's transaction history on
// Abstract and folds new activity into data/x402-snapshot.json.
//
// Run manually with `node scripts/sync-snapshot.mjs`, or on a schedule via
// .github/workflows/sync-x402-data.yml. Safe to re-run: it resumes from
// `lastSyncedBlock` in the existing snapshot, so a fresh checkout with no
// snapshot walks full history from block 0 (slow, one-time bootstrap);
// every run after that only fetches new blocks.
//
// Config (facilitator address, payment selectors, API base) is shared with
// the Next.js app via config/x402.json — edit that file, not this one, to
// change chain constants.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "config", "x402.json");
const SNAPSHOT_PATH = path.join(ROOT, "data", "x402-snapshot.json");

const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
const SELECTORS = config.paymentSelectors; // { "0x...": "service" | "tip" }
const RECENT_WINDOW_MS = config.recentWindowDays * 24 * 60 * 60 * 1000;
const PAGE_SIZE = 1000;
const SAFETY_MAX_PAGES = 500; // guards against an infinite loop on a bad response

// `recent` is stored as tuples, not objects, to keep the committed snapshot
// (30 days of raw rows at ~1k tx/day) from ballooning — see readme note in
// data/README.md. Order matches SerializedTransfer's fields.
const RECENT_FIELDS = ["hash", "blockNumber", "from", "to", "value", "timestamp", "paymentType"];
const tupleToTransfer = (t) => Object.fromEntries(RECENT_FIELDS.map((k, i) => [k, t[i]]));
const transferToTuple = (t) => RECENT_FIELDS.map((k) => t[k]);

function emptySnapshot() {
  return {
    lastSyncedBlock: 0,
    lastSyncedAt: null,
    cumulative: {
      totalCount: 0,
      totalVolume: "0",
      typeCounts: {},
      buyers: [],
    },
    sellers: {},
    daily: {},
    recent: [],
  };
}

function loadSnapshot() {
  if (!existsSync(SNAPSHOT_PATH)) return emptySnapshot();
  try {
    return JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8"));
  } catch (err) {
    console.error("Failed to parse existing snapshot, starting fresh:", err);
    return emptySnapshot();
  }
}

async function fetchTxPage(startblock) {
  const url = new URL(config.abscanApi);
  url.searchParams.set("module", "account");
  url.searchParams.set("action", "txlist");
  url.searchParams.set("address", config.facilitatorAddress);
  url.searchParams.set("sort", "asc");
  url.searchParams.set("offset", String(PAGE_SIZE));
  url.searchParams.set("startblock", String(startblock));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`txlist request failed: ${res.status}`);
  const json = await res.json();
  const result = json.result;
  return Array.isArray(result) ? result : [];
}

async function fetchTipHashes() {
  try {
    const res = await fetch(config.ackTipsUrl);
    if (!res.ok) return new Set();
    const data = await res.json();
    return new Set((data.hashes ?? []).map((h) => String(h).toLowerCase()));
  } catch (err) {
    console.warn("Could not fetch ACK tip hash registry, continuing without it:", err.message);
    return new Set();
  }
}

function decodePayment(input) {
  const selector = input.slice(0, 10);
  const paymentType = SELECTORS[selector];
  if (!paymentType) return null;
  if (input.length < 202) return null;

  const from = "0x" + input.slice(34, 74);
  const to = "0x" + input.slice(98, 138);
  const value = BigInt("0x" + input.slice(138, 202));

  return { from: from.toLowerCase(), to: to.toLowerCase(), value, paymentType };
}

function dateKey(timestampSec) {
  return new Date(timestampSec * 1000).toISOString().slice(0, 10);
}

async function main() {
  const snapshot = loadSnapshot();
  const tipHashes = await fetchTipHashes();

  // Reconstruct working sets from the persisted arrays so we can dedupe cheaply.
  const cumulativeBuyers = new Set(snapshot.cumulative.buyers);
  let cumulativeVolume = BigInt(snapshot.cumulative.totalVolume);
  let cumulativeCount = snapshot.cumulative.totalCount;
  const typeCounts = { ...snapshot.cumulative.typeCounts };

  const sellers = {};
  for (const [addr, s] of Object.entries(snapshot.sellers)) {
    sellers[addr] = {
      txCount: s.txCount,
      totalVolume: BigInt(s.totalVolume),
      buyers: new Set(s.buyers),
      firstSeen: s.firstSeen,
      lastActive: s.lastActive,
    };
  }

  const daily = {};
  for (const [day, d] of Object.entries(snapshot.daily)) {
    daily[day] = { count: d.count, volume: BigInt(d.volume) };
  }

  const newTransfers = [];
  let startblock = snapshot.lastSyncedBlock + 1;
  let lastBlockSeen = snapshot.lastSyncedBlock;
  let pages = 0;

  while (pages < SAFETY_MAX_PAGES) {
    const page = await fetchTxPage(startblock);
    pages += 1;
    if (page.length === 0) break;

    for (const tx of page) {
      lastBlockSeen = Math.max(lastBlockSeen, Number(tx.blockNumber));
      if (tx.isError === "1") continue;

      const decoded = decodePayment(tx.input ?? "");
      if (!decoded) continue;

      const { from, to, value } = decoded;
      const paymentType = tipHashes.has(tx.hash.toLowerCase()) ? "tip" : decoded.paymentType;
      const timestamp = Number(tx.timeStamp);

      cumulativeCount += 1;
      cumulativeVolume += value;
      cumulativeBuyers.add(from);
      typeCounts[paymentType] = (typeCounts[paymentType] ?? 0) + 1;

      if (!sellers[to]) {
        sellers[to] = { txCount: 0, totalVolume: 0n, buyers: new Set(), firstSeen: timestamp, lastActive: 0 };
      }
      const seller = sellers[to];
      seller.txCount += 1;
      seller.totalVolume += value;
      seller.buyers.add(from);
      seller.firstSeen = Math.min(seller.firstSeen, timestamp);
      seller.lastActive = Math.max(seller.lastActive, timestamp);

      const day = dateKey(timestamp);
      if (!daily[day]) daily[day] = { count: 0, volume: 0n };
      daily[day].count += 1;
      daily[day].volume += value;

      newTransfers.push({
        hash: tx.hash,
        blockNumber: tx.blockNumber,
        from,
        to,
        value: value.toString(),
        timestamp,
        paymentType,
      });
    }

    if (page.length < PAGE_SIZE) break;
    startblock = lastBlockSeen + 1;
  }

  if (pages >= SAFETY_MAX_PAGES) {
    console.warn(`Hit SAFETY_MAX_PAGES (${SAFETY_MAX_PAGES}) — sync may be incomplete, will resume next run.`);
  }

  // Merge new transfers into the rolling recent window, then trim by age.
  // Existing entries are persisted as tuples; expand them back to objects
  // for merging, then re-compact below.
  const cutoffMs = Date.now() - RECENT_WINDOW_MS;
  const existing = snapshot.recent.map((t) => (Array.isArray(t) ? tupleToTransfer(t) : t));
  const merged = [...existing, ...newTransfers].filter(
    (t) => t.timestamp * 1000 >= cutoffMs,
  );
  merged.sort((a, b) => b.timestamp - a.timestamp);

  const changed = newTransfers.length > 0 || merged.length !== snapshot.recent.length;
  if (!changed) {
    console.log("No new activity and nothing to trim — snapshot unchanged.");
    return;
  }

  const output = {
    lastSyncedBlock: lastBlockSeen,
    lastSyncedAt: new Date().toISOString(),
    cumulative: {
      totalCount: cumulativeCount,
      totalVolume: cumulativeVolume.toString(),
      typeCounts,
      buyers: [...cumulativeBuyers].sort(),
    },
    sellers: Object.fromEntries(
      Object.entries(sellers)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([addr, s]) => [
          addr,
          {
            txCount: s.txCount,
            totalVolume: s.totalVolume.toString(),
            buyers: [...s.buyers].sort(),
            firstSeen: s.firstSeen,
            lastActive: s.lastActive,
          },
        ]),
    ),
    daily: Object.fromEntries(
      Object.entries(daily)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([day, d]) => [day, { count: d.count, volume: d.volume.toString() }]),
    ),
    recent: merged.map(transferToTuple),
  };

  // Minified: `recent` alone is tens of thousands of rows at current volume,
  // and pretty-printing roughly doubles the committed file size for no
  // benefit (nobody reads this file by hand — sellers/daily/cumulative are
  // small enough that readability there isn't worth a bigger diff either).
  writeFileSync(SNAPSHOT_PATH, JSON.stringify(output) + "\n");
  console.log(
    `Synced ${newTransfers.length} new payment(s) through block ${lastBlockSeen}. ` +
      `Cumulative: ${cumulativeCount} txs, $${(Number(cumulativeVolume) / 1_000_000).toFixed(2)}, ` +
      `${cumulativeBuyers.size} buyers, ${Object.keys(sellers).length} sellers. ` +
      `Recent window: ${merged.length} rows.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
