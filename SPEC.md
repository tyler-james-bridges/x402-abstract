# x402 Abstract Explorer - Build Spec

## Overview
A lightweight x402 payment explorer for Abstract L2 (chain 2741). First and only x402 scanner on Abstract.

## Stack
- Next.js 15 (App Router, already scaffolded)
- Tailwind CSS (already configured)
- viem (already installed)
- No database - all data fetched from chain in real-time with caching

## Abstract Chain Config
- Chain ID: 2741
- RPC: https://api.mainnet.abs.xyz
- USDC.e: 0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1 (6 decimals)
- Block explorer: https://abscan.org

## Design
- Dark theme (bg-gray-950 base, bg-gray-900 cards, border-gray-800 borders)
- Clean, minimal, data-dense like x402scan.com but simpler
- Mobile responsive
- ZERO emojis in code

## Pages

### Home Page (/)
Header: "x402 Abstract" logo/title + tagline "x402 payment explorer for Abstract L2"

**Stats Bar** (top):
- Total x402 Transfers (count)
- Total Volume (USD)
- Unique Buyers
- Unique Sellers

**Recent Transactions** table:
- Columns: Seller | Amount | Buyer | TX Hash | Time | Facilitator
- Amount formatted as USD (e.g. "$0.01")
- Addresses truncated (0x1234...5678) with copy button
- TX Hash links to abscan.org/tx/{hash}
- Time as relative ("2m ago", "1h ago")
- Show last 50 transactions
- Auto-refresh every 30 seconds

**Top Sellers** table:
- Columns: Address | Transactions | Volume | Buyers | Last Active
- Sorted by transaction count descending

### Seller Detail Page (/seller/[address])
- Address, total volume, transaction count, unique buyers
- Transaction history for that seller

## Data Source: On-Chain

### How x402 works on-chain
x402 payments are USDC.e ERC-20 transfers. The flow:
1. Buyer sends USDC.e to a facilitator contract (like Coinbase's)
2. Facilitator forwards USDC.e to the seller (the x402 server)

We can detect x402 payments by scanning USDC.e Transfer events. The key pattern:
- Transfer(from=facilitator, to=seller, value=amount)

### Known Facilitator Addresses on Base (may not exist on Abstract yet)
Since we're the FIRST x402 services on Abstract, our own transactions are the starting point.
We should scan ALL USDC.e transfers and identify patterns.

### API Routes

**GET /api/transfers**
- Fetches recent USDC.e Transfer events from Abstract
- Uses viem's getLogs with the Transfer event signature
- Cache results for 30 seconds (use Next.js unstable_cache or simple in-memory)
- Parameters: limit (default 50), offset, seller (optional filter)
- Returns: { transfers: [...], stats: { totalCount, totalVolume, uniqueBuyers, uniqueSellers } }

**GET /api/stats**
- Aggregated stats from cached transfer data
- Returns: { totalTransfers, totalVolumeUsd, uniqueBuyers, uniqueSellers, lastUpdated }

### Implementation Details

1. Create a lib/abstract.ts with:
   - Abstract chain definition for viem
   - Public client instance
   - USDC.e contract address and ABI (just Transfer event)

2. Create a lib/transfers.ts with:
   - Function to fetch recent USDC.e transfers (last 1000 blocks ~= last few hours)
   - Parse Transfer events into typed objects
   - Compute aggregate stats
   - Simple in-memory cache with TTL

3. Format helpers in lib/format.ts:
   - formatAddress(addr): truncate to 0x1234...5678
   - formatUsd(amount): format USDC amount (6 decimals) to "$X.XX"
   - timeAgo(timestamp): relative time string

4. Components:
   - StatsBar: 4 stat cards in a row
   - TransactionTable: sortable table with columns
   - SellerTable: aggregated seller stats
   - AddressCell: truncated address with copy-to-clipboard
   - Layout: dark theme header with navigation

## Constraints
- ZERO emojis in codebase
- Use proper TypeScript types, no `any`
- All Tailwind, no custom CSS files
- Dark mode only (no light mode toggle needed)
- No database dependencies
- No authentication
- Keep it simple and fast

## Pre-ship
1. pnpm lint - 0 errors
2. pnpm build - passes
3. Prettier formatted
