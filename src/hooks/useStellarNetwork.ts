import { useCallback } from "react";
import { useStellarContext } from "../context";
import type { StellarNetwork, CustomNetworkConfig, NetworkConfig } from "../types";

export interface UseStellarNetworkReturn {
  network: StellarNetwork;
  networkPassphrase: string;
  horizonUrl: string;
  sorobanRpcUrl: string;
  config: NetworkConfig;
  setNetwork: (network: StellarNetwork, customConfig?: CustomNetworkConfig) => void;
}

/**
 * Read the active network and switch networks at runtime without remounting.
 *
 * @example
 * ```tsx
 * const { network, setNetwork } = useStellarNetwork();
 *
 * return (
 *   <button onClick={() => setNetwork("mainnet")}>
 *     Switch to Mainnet (currently {network})
 *   </button>
 * );
 * ```
 */
export function useStellarNetwork(): UseStellarNetworkReturn {
  const { config, network, switchNetwork } = useStellarContext();

  const setNetwork = useCallback(
    (newNetwork: StellarNetwork, customConfig?: CustomNetworkConfig) => {
      switchNetwork(newNetwork, customConfig);
    },
    [switchNetwork],
  );

  return {
    network,
    networkPassphrase: config.networkPassphrase,
    horizonUrl: config.horizonUrl,
    sorobanRpcUrl: config.sorobanRpcUrl,
    config,
    setNetwork,
  };
}
