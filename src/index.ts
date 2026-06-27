// Provider
export { StellarProvider } from "./context";

// Hooks
export { useFreighter } from "./hooks/useFreighter";
export { useStellarAccount } from "./hooks/useStellarAccount";
export { useStellarBalance } from "./hooks/useStellarBalance";
export { useSorobanContract } from "./hooks/useSorobanContract";
export { useTransaction } from "./hooks/useTransaction";
export { useLedgerEntry } from "./hooks/useLedgerEntry";
export { useStellarToml } from "./hooks/useStellarToml";
export { useAssetMetadata } from "./hooks/useAssetMetadata";
export { useStellarOffers } from "./hooks/useStellarOffers";
export { usePathPayment } from "./hooks/usePathPayment";
export type {
  PathPaymentAsset,
  UsePathPaymentOptions,
  UsePathPaymentReturn,
} from "./hooks/usePathPayment";

export { useAssetBalance } from "./hooks/useAssetBalance";
export type { AssetDescriptor, UseAssetBalanceReturn } from "./hooks/useAssetBalance";

export { useTrustlines } from "./hooks/useTrustlines";
export type { TrustlineAsset, UseTrustlinesReturn } from "./hooks/useTrustlines";

export { useAccountMerge } from "./hooks/useAccountMerge";
export type { UseAccountMergeReturn } from "./hooks/useAccountMerge";

export { useSorobanServer } from "./hooks/useSorobanServer";

// Types
export type {
  // Network
  StellarNetwork,
  NetworkConfig,
  // Account
  StellarAccountData,
  StellarBalance,
  // Wallet
  FreighterState,
  UseFreighterReturn,
  SignTransactionOptions,
  // Transactions
  TransactionStatus,
  TransactionState,
  // Contract
  ContractCallOptions,
  UseContractCallReturn,
  // Ledger
  LedgerEntryState,
  // Provider
  StellarProviderProps,
  StellarContextValue,
} from "./types";

// Hook-specific Types
export type { StellarTomlData, UseStellarTomlReturn } from "./hooks/useStellarToml";
export type { AssetMetadata, UseAssetMetadataReturn } from "./hooks/useAssetMetadata";
export type { UseStellarOffersOptions, UseStellarOffersReturn } from "./hooks/useStellarOffers";

// Network presets (useful for custom configs)
export { NETWORK_CONFIGS } from "./types";
