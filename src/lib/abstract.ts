import { defineChain } from "viem";

export const abstractChain = defineChain({
  id: 2741,
  name: "Abstract",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.mainnet.abs.xyz"] },
  },
  blockExplorers: {
    default: { name: "Abscan", url: "https://abscan.org" },
  },
});

export const ABSCAN_API = "https://block-explorer-api.mainnet.abs.xyz/api";

export const FACILITATOR_ADDRESS =
  "0xd6316bca0446b63f2deffa8ed4e8191912a5e7e1";

// Known facilitator method selectors for x402 payments
export const PAYMENT_SELECTORS = ["0xe3ee160e", "0xcf092995"];
