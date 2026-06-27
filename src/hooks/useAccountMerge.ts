import { useCallback, useReducer } from "react";
import {
  Horizon,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { useStellarContext } from "../context";
import { useFreighter } from "./useFreighter";
import { useTransaction } from "./useTransaction";
import type { TransactionStatus } from "../types";

export interface UseAccountMergeReturn {
  merge: (destination: string, opts: { confirm: true }) => Promise<void>;
  status: TransactionStatus;
  hash: string | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export function useAccountMerge(): UseAccountMergeReturn {
  const { config } = useStellarContext();
  const { publicKey, signTransaction } = useFreighter();
  const { submit: submitXdr, reset, ...txState } = useTransaction({
    mode: "classic",
  });

  const merge = useCallback(
    async (destination: string, opts: { confirm: true }) => {
      if (opts.confirm !== true) {
        throw new Error(
          "You must explicitly confirm the account merge by passing { confirm: true }."
        );
      }

      if (!publicKey) {
        throw new Error("Freighter is not connected. Call connect() first.");
      }

      const server = new Horizon.Server(config.horizonUrl);
      const sourceAccount = await server.loadAccount(publicKey);

      const tx = new TransactionBuilder(sourceAccount, {
        fee: "100",
        networkPassphrase: config.networkPassphrase,
      })
        .addOperation(Operation.accountMerge({ destination }))
        .setTimeout(60)
        .build();

      const signedXdr = await signTransaction(tx.toXDR(), {
        networkPassphrase: config.networkPassphrase,
      });

      await submitXdr(signedXdr);
    },
    [publicKey, config, signTransaction, submitXdr]
  );

  return {
    merge,
    reset,
    status: txState.status,
    hash: txState.hash,
    error: txState.error,
    isLoading: txState.isLoading,
    isSuccess: txState.isSuccess,
    isError: txState.isError,
  };
}
