"use client";

import { useTransaction, useFreighter } from "stellar-hooks";
import { Operation, Asset } from "@stellar/stellar-sdk";

export function TransactionSection() {
  const { publicKey } = useFreighter();
  const { submit, status, hash, isLoading, isSuccess, isError, error, reset } =
    useTransaction({
      fee: 100,
      memo: "hello from stellar-hooks",
      onSuccess: (txHash) => console.log("Transaction confirmed:", txHash),
    });

  const handlePayment = async () => {
    if (!publicKey) return;
    try {
      await submit([
        Operation.payment({
          destination: publicKey,
          asset: Asset.native(),
          amount: "1",
        }),
      ]);
    } catch (err) {
      console.error("Payment failed:", err);
    }
  };

  if (!publicKey) {
    return (
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-2 text-lg font-semibold">Transaction</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Connect your wallet to send transactions.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="mb-4 text-lg font-semibold">Transaction</h2>
      <div className="mb-4 space-y-2">
        <p className="text-sm text-[var(--color-text-muted)]">
          Status: <span className="font-medium text-white">{status}</span>
        </p>
        {hash && (
          <p className="text-xs text-[var(--color-text-muted)]">
            Hash: <span className="font-mono">{hash}</span>
          </p>
        )}
        {isSuccess && (
          <p className="text-sm text-[var(--color-success)]">
            Transaction confirmed on-chain.
          </p>
        )}
        {isError && error && (
          <p className="text-sm text-[var(--color-error)]">{error.message}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Submitting..." : "Send 1 XLM to Self"}
        </button>
        {(isSuccess || isError) && (
          <button
            onClick={reset}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text-muted)] transition-colors hover:text-white"
          >
            Reset
          </button>
        )}
      </div>
    </section>
  );
}
