import type { StellarNetwork, CustomNetworkConfig, StellarContractId } from "stellar-hooks";

export const STELLAR_NETWORK = (process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet") as StellarNetwork;

export const CUSTOM_NETWORK_CONFIG: CustomNetworkConfig | undefined =
  STELLAR_NETWORK === "custom"
    ? {
        network: "custom",
        horizonUrl: process.env.NEXT_PUBLIC_HORIZON_URL ?? "https://horizon-testnet.stellar.org",
        sorobanRpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org",
        networkPassphrase: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015",
      }
    : undefined;

export const COUNTER_CONTRACT_ID: StellarContractId | "" =
  (process.env.NEXT_PUBLIC_COUNTER_CONTRACT_ID ?? "") as StellarContractId | "";
