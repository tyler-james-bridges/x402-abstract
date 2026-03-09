import { publicClient, USDC_E_ADDRESS, TRANSFER_EVENT_ABI } from "./abstract";

export interface Transfer {
  hash: string;
  blockNumber: bigint;
  from: string;
  to: string;
  value: bigint;
  timestamp: number;
}

export interface SerializedTransfer {
  hash: string;
  blockNumber: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
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

interface Cache {
  data: Transfer[];
  timestamp: number;
}

const cache: Cache = { data: [], timestamp: 0 };
const CACHE_TTL_MS = 30_000;

export async function fetchTransfers(
  limit = 50,
  seller?: string,
): Promise<Transfer[]> {
  const now = Date.now();

  if (cache.data.length > 0 && now - cache.timestamp < CACHE_TTL_MS) {
    const cached = cache.data;
    const filtered = seller
      ? cached.filter((t) => t.to.toLowerCase() === seller.toLowerCase())
      : cached;
    return filtered.slice(0, limit);
  }

  const latestBlock = await publicClient.getBlockNumber();
  const fromBlock = latestBlock > 2000n ? latestBlock - 2000n : 0n;

  const logs = await publicClient.getLogs({
    address: USDC_E_ADDRESS,
    event: TRANSFER_EVENT_ABI,
    fromBlock,
    toBlock: latestBlock,
  });

  const blockNumbers = [...new Set(logs.map((l) => l.blockNumber))].filter(
    (bn): bn is bigint => bn !== null,
  );

  const blockTimestamps = new Map<bigint, number>();
  await Promise.all(
    blockNumbers.map(async (bn) => {
      const block = await publicClient.getBlock({ blockNumber: bn });
      blockTimestamps.set(bn, Number(block.timestamp));
    }),
  );

  const transfers: Transfer[] = logs
    .filter(
      (log) =>
        log.transactionHash !== null &&
        log.blockNumber !== null &&
        log.args.from !== undefined &&
        log.args.to !== undefined &&
        log.args.value !== undefined,
    )
    .map((log) => ({
      hash: log.transactionHash as string,
      blockNumber: log.blockNumber as bigint,
      from: log.args.from as string,
      to: log.args.to as string,
      value: log.args.value as bigint,
      timestamp: blockTimestamps.get(log.blockNumber as bigint) ?? 0,
    }))
    .sort((a, b) => Number(b.blockNumber - a.blockNumber));

  cache.data = transfers;
  cache.timestamp = now;

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
    blockNumber: t.blockNumber.toString(),
    from: t.from,
    to: t.to,
    value: t.value.toString(),
    timestamp: t.timestamp,
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
