import { createPublicClient, http, defineChain, parseAbiItem } from "viem";

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

export const publicClient = createPublicClient({
  chain: abstractChain,
  transport: http(),
});

export const USDC_E_ADDRESS =
  "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1" as const;

export const TRANSFER_EVENT_ABI = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
);
