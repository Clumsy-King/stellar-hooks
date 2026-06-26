/**
 * @file usePayment.ts
 * @description Hook for building and submitting Stellar payments.
 * @package stellar-hooks
 * @license MIT
 */

import { useCallback } from "react";
import { Asset, Operation } from "@stellar/stellar-sdk";
import { useStellarTransaction } from "./useStellarTransaction";
import type { TransactionStatus } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Describes the asset to send.
 * Use `{ type: "native" }` for XLM.
 * Use `{ type: "credit", code: "USDC", issuer: "G..." }` for any other asset.
 */
export type PaymentAsset =
  | { type: "native" }
  | { type: "credit"; code: string; issuer: string };

export interface UsePaymentOptions {
  /** Recipient Stellar address (G...) */
  destination: string;
  /** Asset to send */
  asset: PaymentAsset;
  /** Amount as a string, e.g. "10.5" */
  amount: string;
  /** Optional memo text (max 28 bytes) */
  memo?: string;
  /** Fee in stroops. Default: 100 */
  fee?: number;
  /** Polling timeout in seconds. Default: 60 */
  timeoutSeconds?: number;
  /** Callback fired when the transaction is successfully confirmed. */
  onSuccess?: (hash: string) => void;
  /** Callback fired when the transaction fails or an error occurs. */
  onError?: (error: Error) => void;
}

/**
 * @example
 * ```tsx
 * const {
 *   submit,    // () => Promise<void> — build, sign, and submit the payment
 *   status,    // "idle" | "submitting" | "polling" | "success" | "error"
 *   hash,      // string | null — transaction hash on success
 *   isLoading, // boolean
 *   isSuccess, // boolean
 *   isError,   // boolean
 *   error,     // Error | null
 *   reset,     // () => void
 * } = usePayment({
 *   destination: "GBXXX...",
 *   asset: { type: "native" },
 *   amount: "10",
 *   memo: "Thanks!",
 * });
 *
 * return <button onClick={submit} disabled={isLoading}>Send XLM</button>;
 * ```
 */
export interface UsePaymentReturn {
  /** Call this to build, sign, and submit the payment */
  submit: () => Promise<void>;
  status: TransactionStatus;
  hash: string | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Builds a classic Stellar payment operation, signs it via Freighter,
 * and submits it through Horizon with polling for confirmation.
 *
 * Wraps `useTransaction({ mode: "classic" })` for submission and polling.
 *
 * @example
 * ```tsx
 * const { submit, status, hash, error } = usePayment({
 *   destination: "GBXXX...",
 *   asset: { type: "native" },
 *   amount: "10",
 *   memo: "Thanks!",
 * });
 *
 * return <button onClick={submit}>Send XLM</button>;
 * ```
 */
export function usePayment(options: UsePaymentOptions): UsePaymentReturn {
  const {
    destination,
    asset,
    amount,
    memo,
    fee = 100,
    timeoutSeconds = 60,
    onSuccess,
    onError,
  } = options;

  const { submit: submitTx, ...txState } = useStellarTransaction({
    fee,
    timeoutSeconds,
    memo,
    onSuccess,
    onError,
  });

  const submit = useCallback(async () => {
    const stellarAsset =
      asset.type === "native"
        ? Asset.native()
        : new Asset(asset.code, asset.issuer);

    const operation = Operation.payment({
      destination,
      asset: stellarAsset,
      amount,
    });

    await submitTx([operation]);
  }, [destination, asset, amount, submitTx]);

  return {
    ...txState,
    status: txState.status,
    hash: txState.hash,
    error: txState.error,
    isLoading: txState.isLoading,
    isSuccess: txState.isSuccess,
    isError: txState.isError,
    submit,
  };
}