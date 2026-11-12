import * as chains from "viem/chains";

export type BaseConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  burnerWalletMode: "localNetworksOnly" | "allNetworks" | "disabled";
};

export type ScaffoldConfig = BaseConfig;

export const DEFAULT_ALCHEMY_API_KEY = "IZYEU2cWBgnFmgiTAgpWD";

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [chains.baseSepolia],

  // How often the front-end polls the RPC for new data (ms)
  pollingInterval: 3000,

  // Default Alchemy key shared by all Scaffold-ETH users (rate-limited).
  // Get your own at https://dashboard.alchemy.com and put it in .env.local
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  // Use a different RPC for a specific chain ID if the default is slow or rate-limited
  rpcOverrides: {
    // [chains.baseSepolia.id]: "https://sepolia.base.org",
  },

  // Get your own at https://cloud.walletconnect.com
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Burner wallet only shows on local chains. On Base Sepolia you use MetaMask.
  burnerWalletMode: "localNetworksOnly",
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;