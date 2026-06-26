/**
 * @file useClaimableBalance.ts
 * @description Hook for fetching claimable balances from the Stellar network.
 * @package stellar-hooks
 */

import { useCallback, useReducer } from "react";
import { Horizon, Operation } from "@stellar/stellar-sdk";
import { useStellarContext } from "../context";
import { useStellarTransaction } from "./useStellarTransaction";
import type { TransactionStatus } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClaimableBalanceRecord {
  id: string;
  asset: string;
  amount: string;
  sponsor: string;
  lastModifiedLedger: number;
  claimants: Array<{
    destination: string;
    predicate: Record<string, unknown>;
  }>;
}

export interface ClaimableBalancesState {
  balances: ClaimableBalanceRecord[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * @example
 * ```tsx
 * const {
 *   balances,  // ClaimableBalanceRecord[] — list of claimable balances
 *   isLoading, // boolean
 *   error,     // Error | null
 *   refetch,   // () => Promise<void>
 * } = useClaimableBalances(publicKey);
 *
 * // Each record: { id, asset, amount, sponsor, lastModifiedLedger, claimants }
 * ```
 */
export interface UseClaimableBalancesReturn extends ClaimableBalancesState {
  refetch: () => Promise<void>;
}

/**
 * @example
 * ```tsx
 * const {
 *   claim,     // (balanceId: string) => Promise<void>
 *   status,    // "idle" | "submitting" | "polling" | "success" | "error"
 *   hash,      // string | null
 *   isLoading, // boolean
 *   isSuccess, // boolean
 *   isError,   // boolean
 *   error,     // Error | null
 *   reset,     // () => void
 * } = useClaimBalance();
 *
 * return <button onClick={() => claim(balance.id)}>Claim</button>;
 * ```
 */
export interface UseClaimBalanceReturn {
  claim: (balanceId: string) => Promise<void>;
  status: TransactionStatus;
  hash: string | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export interface UseClaimBalanceOptions {
  /** Polling timeout in seconds. Default: 60 */
  timeoutSeconds?: number;
  /** Callback fired when the transaction is successfully confirmed. */
  onSuccess?: (hash: string) => void;
  /** Callback fired when the transaction fails or an error occurs. */
  onError?: (error: Error) => void;
}

// ─── List hook reducer ────────────────────────────────────────────────────────

type ListAction =
  | { type: "LOADING" }
  | { type: "SUCCESS"; payload: ClaimableBalanceRecord[] }
  | { type: "ERROR"; payload: Error };

function listReducer(
  state: ClaimableBalancesState,
  action: ListAction
): ClaimableBalancesState {
  switch (action.type) {
    case "LOADING":
      return { ...state, isLoading: true, error: null };
    case "SUCCESS":
      return { balances: action.payload, isLoading: false, error: null };
    case "ERROR":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

const listInitial: ClaimableBalancesState = {
  balances: [],
  isLoading: false,
  error: null,
};

// ─── useClaimableBalances ─────────────────────────────────────────────────────

/**
 * Fetches all claimable balances for a given public key from Horizon.
 * Predicates are included in the returned data for display but not enforced.
 *
 * @example
 * ```tsx
 * const { balances, isLoading, refetch } = useClaimableBalances(publicKey);
 * ```
 */
export function useClaimableBalances(
  publicKey: string | null
): UseClaimableBalancesReturn {
  const { config } = useStellarContext();
  const [state, dispatch] = useReducer(listReducer, listInitial);

  const refetch = useCallback(async () => {
    if (!publicKey) return;

    dispatch({ type: "LOADING" });

    try {
      const server = new Horizon.Server(config.horizonUrl);
      const response = await server
        .claimableBalances()
        .claimant(publicKey)
        .call();

      const balances: ClaimableBalanceRecord[] = response.records.map(
        (r: Horizon.ServerApi.ClaimableBalanceRecord) => ({
          id: r.id,
          asset: r.asset,
          amount: r.amount,
          sponsor: r.sponsor ?? "",
          lastModifiedLedger: r.last_modified_ledger,
          claimants: r.claimants.map((c) => ({
            destination: c.destination,
            predicate: c.predicate as Record<string, unknown>,
          })),
        })
      );

      dispatch({ type: "SUCCESS", payload: balances });
    } catch (err) {
      dispatch({
        type: "ERROR",
        payload: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [publicKey, config.horizonUrl]);

  return { ...state, refetch };
}

// ─── useClaimBalance ──────────────────────────────────────────────────────────

/**
 * Builds, signs via Freighter, and submits a claimClaimableBalance operation.
 * Uses `useTransaction({ mode: "classic" })` for submission and polling.
 *
 * @example
 * ```tsx
 * const { claim, status, hash, error } = useClaimBalance({
 *   onSuccess: (hash) => console.log("Claimed!", hash),
 * });
 *
 * return <button onClick={() => claim(balance.id)}>Claim</button>;
 * ```
 */
export function useClaimBalance(
  options: UseClaimBalanceOptions = {}
): UseClaimBalanceReturn {
  const { timeoutSeconds, onSuccess, onError } = options;
  const { submit: submitTx, ...txState } = useStellarTransaction({
    timeoutSeconds,
    onSuccess,
    onError,
  });

  const claim = useCallback(
    async (balanceId: string) => {
      const operation = Operation.claimClaimableBalance({ balanceId });
      await submitTx([operation]);
    },
    [submitTx]
  );

  return {
    ...txState,
    claim,
    status: txState.status,
    hash: txState.hash,
    error: txState.error,
    isLoading: txState.isLoading,
    isSuccess: txState.isSuccess,
    isError: txState.isError,
  };
}