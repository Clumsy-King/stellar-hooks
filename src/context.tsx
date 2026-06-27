/**
 * @file context.tsx
 * @description React Context and Provider for Stellar configuration.
 * @package stellar-hooks
 * @license MIT
 */

import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import type { StellarContextValue, StellarProviderProps, StellarHooksProviderProps, StellarNetwork, CustomNetworkConfig, NetworkConfig } from "./types";
import { NETWORK_CONFIGS } from "./types";

const NETWORK_STORAGE_KEY = "stellar-hooks:network";
const CUSTOM_CONFIG_STORAGE_KEY = "stellar-hooks:custom-config";

interface StellarContextInternalValue extends StellarContextValue {
  switchNetwork: (newNetwork: StellarNetwork, newCustomConfig?: CustomNetworkConfig) => void;
}

const StellarContext = createContext<StellarContextInternalValue | null>(null);

/**
 * Wrap your app (or the portion that needs Stellar) with this provider.
 *
 * @example
 * ```tsx
 * <StellarHooksProvider network="testnet">
 *   <App />
 * </StellarHooksProvider>
 * ```
 */
export function StellarHooksProvider({
  network: initialNetwork,
  horizonUrl: initialHorizonUrl,
  sorobanRpcUrl: initialSorobanRpcUrl,
  networkPassphrase: initialNetworkPassphrase,
  customConfig: initialCustomConfig,
  children,
}: StellarHooksProviderProps) {
  const defaultNetwork = initialNetwork || 
    (initialHorizonUrl || initialSorobanRpcUrl || initialNetworkPassphrase || initialCustomConfig ? "custom" : "testnet");
  const [network, setNetwork] = useState<StellarNetwork>(defaultNetwork);
  
  // Track custom configs and URLs to support switches and overrides
  const [customHorizonUrl, setCustomHorizonUrl] = useState<string | undefined>(
    initialHorizonUrl || initialCustomConfig?.horizonUrl
  );
  const [customSorobanRpcUrl, setCustomSorobanRpcUrl] = useState<string | undefined>(
    initialSorobanRpcUrl || initialCustomConfig?.sorobanRpcUrl
  );
  const [customPassphrase, setCustomPassphrase] = useState<string | undefined>(
    initialNetworkPassphrase || initialCustomConfig?.networkPassphrase
  );

  const requestCache = useMemo(() => new Map<string, Promise<unknown>>(), []);

  useEffect(() => {
    const savedNetwork = localStorage.getItem(NETWORK_STORAGE_KEY) as StellarNetwork;
    if (savedNetwork) setNetwork(savedNetwork);

    const savedCustomConfig = localStorage.getItem(CUSTOM_CONFIG_STORAGE_KEY);
    if (savedCustomConfig) {
      try {
        const parsed = JSON.parse(savedCustomConfig) as CustomNetworkConfig;
        setCustomHorizonUrl(parsed.horizonUrl);
        setCustomSorobanRpcUrl(parsed.sorobanRpcUrl);
        setCustomPassphrase(parsed.networkPassphrase);
      } catch { /* ignore invalid JSON in localStorage */ }
    }
  }, []);

  const switchNetwork = useCallback((newNetwork: StellarNetwork, newCustomConfig?: CustomNetworkConfig) => {
    setNetwork(newNetwork);
    localStorage.setItem(NETWORK_STORAGE_KEY, newNetwork);

    if (newNetwork === "custom" && newCustomConfig) {
      setCustomHorizonUrl(newCustomConfig.horizonUrl);
      setCustomSorobanRpcUrl(newCustomConfig.sorobanRpcUrl);
      setCustomPassphrase(newCustomConfig.networkPassphrase);
      localStorage.setItem(CUSTOM_CONFIG_STORAGE_KEY, JSON.stringify(newCustomConfig));
    }
  }, []);

  const config = useMemo<NetworkConfig>(() => {
    const presetConfig = network !== "custom" ? NETWORK_CONFIGS[network as keyof typeof NETWORK_CONFIGS] : undefined;

    if (network === "custom") {
      if (customHorizonUrl || customSorobanRpcUrl || customPassphrase) {
        return {
          network: "custom",
          horizonUrl: customHorizonUrl || "",
          sorobanRpcUrl: customSorobanRpcUrl || "",
          networkPassphrase: customPassphrase || "",
        };
      }
      return NETWORK_CONFIGS.testnet;
    }

    const base = presetConfig || NETWORK_CONFIGS.testnet;
    return {
      ...base,
      horizonUrl: customHorizonUrl ?? base.horizonUrl,
      sorobanRpcUrl: customSorobanRpcUrl ?? base.sorobanRpcUrl,
      networkPassphrase: customPassphrase ?? base.networkPassphrase,
    };
  }, [network, customHorizonUrl, customSorobanRpcUrl, customPassphrase]);

  const value = useMemo<StellarContextInternalValue>(
    () => ({ config, network, switchNetwork, requestCache }),
    [config, network, switchNetwork, requestCache]
  );

  return (
    <StellarContext.Provider value={value}>{children}</StellarContext.Provider>
  );
}

/**
 * Wrap your app (or the portion that needs Stellar) with this provider.
 *
 * @example
 * ```tsx
 * <StellarProvider network="testnet">
 *   <App />
 * </StellarProvider>
 * ```
 */
export function StellarProvider({
  network = "testnet",
  customConfig,
  children,
}: StellarProviderProps) {
  return (
    <StellarHooksProvider
      network={network}
      customConfig={customConfig}
    >
      {children}
    </StellarHooksProvider>
  );
}

/**
 * Optional context reader — returns null when rendered outside {@link StellarProvider} or {@link StellarHooksProvider}.
 */
export function useOptionalStellarContext(): StellarContextInternalValue | null {
  return useContext(StellarContext);
}

/**
 * Internal hook — consume the Stellar context inside other hooks.
 */
export function useStellarContext(): StellarContextInternalValue {
  const ctx = useContext(StellarContext);
  if (!ctx) {
    throw new Error(
      "[stellar-hooks] useStellarContext must be used inside <StellarProvider>."
    );
  }
  return ctx;
}
