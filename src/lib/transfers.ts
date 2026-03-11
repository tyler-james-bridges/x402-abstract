import {
  ABSCAN_API,
  FACILITATOR_ADDRESS,
  PAYMENT_SELECTORS,
} from "./abstract";

export type PaymentType = "tip" | "service";

export interface Transfer {
  hash: string;
  blockNumber: string;
  from: string;
  to: string;
  value: bigint;
  timestamp: number;
  paymentType: PaymentType;
}

export interface SerializedTransfer {
  hash: string;
  blockNumber: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  paymentType: PaymentType;
}

export interface SellerStats {
  address: string;
  txCount: number;
  totalVolume: bigint;
  uniqueBuyers: Set<string>;
  lastActive: number;
}

export interface SerializedSellerStats {
  address: string;
  txCount: number;
  totalVolume: string;
  uniqueBuyerCount: number;
  lastActive: number;
}

export interface Stats {
  totalCount: number;
  totalVolume: bigint;
  uniqueBuyers: number;
  uniqueSellers: number;
}

export interface SerializedStats {
  totalCount: number;
  totalVolume: string;
  uniqueBuyers: number;
  uniqueSellers: number;
}

interface AbscanTx {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  input: string;
  isError: string;
}

function decodePayment(input: string): {
  from: string;
  to: string;
  value: bigint;
  paymentType: PaymentType;
} | null {
  const selector = input.slice(0, 10);
  if (!PAYMENT_SELECTORS.includes(selector)) return null;
  if (input.length < 202) return null;

  const from = "0x" + input.slice(34, 74);
  const to = "0x" + input.slice(98, 138);
  const value = BigInt("0x" + input.slice(138, 202));
  const paymentType: PaymentType = selector === "0xe3ee160e" ? "service" : "tip";

  return { from, to, value, paymentType };
}

export async function fetchTransfers(
  limit = 50,
  seller?: string,
): Promise<Transfer[]> {
  const url = new URL(ABSCAN_API);
  url.searchParams.set("module", "account");
  url.searchParams.set("action", "txlist");
  url.searchParams.set("address", FACILITATOR_ADDRESS);
  url.searchParams.set("sort", "desc");
  url.searchParams.set("offset", "200");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];

  const json = await res.json();
  const txList: AbscanTx[] = json.result ?? [];

  const transfers: Transfer[] = [];

  for (const tx of txList) {
    if (tx.isError === "1") continue;

    const decoded = decodePayment(tx.input);
    if (!decoded) continue;

    transfers.push({
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      from: decoded.from,
      to: decoded.to,
      value: decoded.value,
      timestamp: Number(tx.timeStamp),
      paymentType: decoded.paymentType,
    });
  }

  const filtered = seller
    ? transfers.filter((t) => t.to.toLowerCase() === seller.toLowerCase())
    : transfers;

  return filtered.slice(0, limit);
}

export function computeStats(transfers: Transfer[]): Stats {
  const buyers = new Set<string>();
  const sellers = new Set<string>();
  let totalVolume = 0n;

  for (const t of transfers) {
    buyers.add(t.from.toLowerCase());
    sellers.add(t.to.toLowerCase());
    totalVolume += t.value;
  }

  return {
    totalCount: transfers.length,
    totalVolume,
    uniqueBuyers: buyers.size,
    uniqueSellers: sellers.size,
  };
}

export function computeSellerStats(transfers: Transfer[]): SellerStats[] {
  const map = new Map<string, SellerStats>();

  for (const t of transfers) {
    const key = t.to.toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        address: t.to,
        txCount: 0,
        totalVolume: 0n,
        uniqueBuyers: new Set<string>(),
        lastActive: 0,
      });
    }
    const entry = map.get(key)!;
    entry.txCount += 1;
    entry.totalVolume += t.value;
    entry.uniqueBuyers.add(t.from.toLowerCase());
    if (t.timestamp > entry.lastActive) entry.lastActive = t.timestamp;
  }

  return [...map.values()].sort((a, b) => b.txCount - a.txCount);
}

export function serializeTransfer(t: Transfer): SerializedTransfer {
  return {
    hash: t.hash,
    blockNumber: t.blockNumber,
    from: t.from,
    to: t.to,
    value: t.value.toString(),
    timestamp: t.timestamp,
    paymentType: t.paymentType,
  };
}

export function serializeStats(s: Stats): SerializedStats {
  return {
    totalCount: s.totalCount,
    totalVolume: s.totalVolume.toString(),
    uniqueBuyers: s.uniqueBuyers,
    uniqueSellers: s.uniqueSellers,
  };
}

export function serializeSellerStats(s: SellerStats): SerializedSellerStats {
  return {
    address: s.address,
    txCount: s.txCount,
    totalVolume: s.totalVolume.toString(),
    uniqueBuyerCount: s.uniqueBuyers.size,
    lastActive: s.lastActive,
  };
}
