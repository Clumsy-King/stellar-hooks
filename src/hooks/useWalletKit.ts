import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { WalletId, WalletAdapter } from "../wallets/types";
import { createAllAdapters } from "../wallets";

export interface UseWalletKitReturn {
  availableWallets: WalletId[];
  activeWallet: WalletId | null;
  publicKey: string | null;
  isConnecting: boolean;
  error: Error | null;
  setActiveWallet: (id: WalletId) => void;
  connect: (walletId?: WalletId) => Promise<string | null>;
  disconnect: () => void;
  signTransaction: (xdr: string, opts?: { networkPassphrase?: string }) => Promise<string>;
}

type State = {
  availableWallets: WalletId[];
  activeWallet: WalletId | null;
  publicKey: string | null;
  isConnecting: boolean;
  error: Error | null;
};

type Action =
  | { type: "SET_AVAILABLE"; wallets: WalletId[] }
  | { type: "CONNECTING" }
  | { type: "CONNECTED"; walletId: WalletId; publicKey: string }
  | { type: "DISCONNECTED" }
  | { type: "SET_ACTIVE"; walletId: WalletId }
  | { type: "ERROR"; payload: Error };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_AVAILABLE":
      return { ...state, availableWallets: action.wallets };
    case "CONNECTING":
      return { ...state, isConnecting: true, error: null };
    case "CONNECTED":
      return {
        ...state,
        activeWallet: action.walletId,
        publicKey: action.publicKey,
        isConnecting: false,
        error: null,
      };
    case "DISCONNECTED":
      return { ...state, activeWallet: null, publicKey: null, isConnecting: false, error: null };
    case "SET_ACTIVE":
      return { ...state, activeWallet: action.walletId };
    case "ERROR":
      return { ...state, isConnecting: false, error: action.payload };
    default:
      return state;
  }
}

const initial: State = {
  availableWallets: [],
  activeWallet: null,
  publicKey: null,
  isConnecting: false,
  error: null,
};

/**
 * Unified multi-wallet hook that detects installed Stellar wallets
 * (Freighter, Lobstr, xBull) and exposes a single interface regardless
 * of which wallet is active.
 *
 * @example
 * ```tsx
 * const { availableWallets, connect, publicKey, signTransaction } = useWalletKit();
 *
 * if (!publicKey) {
 *   return availableWallets.map(id => (
 *     <button key={id} onClick={() => connect(id)}>{id}</button>
 *   ));
 * }
 * return <p>Connected: {publicKey}</p>;
 * ```
 */
export function useWalletKit(): UseWalletKitReturn {
  const [state, dispatch] = useReducer(reducer, initial);
  const adapters = useMemo<WalletAdapter[]>(() => createAllAdapters(), []);

  useEffect(() => {
    const installed = adapters.filter((a) => a.isInstalled()).map((a) => a.id);
    dispatch({ type: "SET_AVAILABLE", wallets: installed });
  }, [adapters]);

  const getAdapter = useCallback(
    (id: WalletId): WalletAdapter => {
      const adapter = adapters.find((a) => a.id === id);
      if (!adapter) throw new Error(`Unknown wallet: ${id}`);
      return adapter;
    },
    [adapters],
  );

  const setActiveWallet = useCallback((id: WalletId) => {
    dispatch({ type: "SET_ACTIVE", walletId: id });
  }, []);

  const connect = useCallback(
    async (walletId?: WalletId): Promise<string | null> => {
      const id = walletId ?? state.activeWallet ?? state.availableWallets[0];
      if (!id) {
        dispatch({ type: "ERROR", payload: new Error("No wallet available") });
        return null;
      }

      dispatch({ type: "CONNECTING" });
      try {
        const adapter = getAdapter(id);
        const publicKey = await adapter.connect();
        dispatch({ type: "CONNECTED", walletId: id, publicKey });
        return publicKey;
      } catch (err) {
        dispatch({ type: "ERROR", payload: err instanceof Error ? err : new Error(String(err)) });
        return null;
      }
    },
    [state.activeWallet, state.availableWallets, getAdapter],
  );

  const disconnect = useCallback(() => {
    if (state.activeWallet) {
      try {
        getAdapter(state.activeWallet).disconnect();
      } catch {
        // adapter may already be unavailable
      }
    }
    dispatch({ type: "DISCONNECTED" });
  }, [state.activeWallet, getAdapter]);

  const signTransaction = useCallback(
    async (xdr: string, opts?: { networkPassphrase?: string }): Promise<string> => {
      if (!state.activeWallet) throw new Error("No active wallet");
      const adapter = getAdapter(state.activeWallet);
      return adapter.signTransaction(xdr, opts);
    },
    [state.activeWallet, getAdapter],
  );

  return useMemo(
    () => ({
      availableWallets: state.availableWallets,
      activeWallet: state.activeWallet,
      publicKey: state.publicKey,
      isConnecting: state.isConnecting,
      error: state.error,
      setActiveWallet,
      connect,
      disconnect,
      signTransaction,
    }),
    [state, setActiveWallet, connect, disconnect, signTransaction],
  );
}
