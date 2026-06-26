"use client";

import { useSorobanContract } from "stellar-hooks";
import { nativeToScVal } from "@stellar/stellar-sdk";
import { COUNTER_CONTRACT_ID } from "@/lib/constants";

export function ContractSection() {
  const { call, status, result, error, reset } = useSorobanContract(COUNTER_CONTRACT_ID, {
    method: "increment",
    args: [nativeToScVal(1, { type: "u32" })],
  });

  if (!COUNTER_CONTRACT_ID) {
    return (
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-2 text-lg font-semibold">Soroban Contract</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Set{" "}
          <code className="rounded bg-[var(--color-bg)] px-1.5 py-0.5 text-xs">
            NEXT_PUBLIC_COUNTER_CONTRACT_ID
          </code>{" "}
          in your <code className="rounded bg-[var(--color-bg)] px-1.5 py-0.5 text-xs">.env.local</code>{" "}
          to interact with a contract.
        </p>
      </section>
    );
  }

  const isBusy = status !== "idle" && status !== "error";

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="mb-4 text-lg font-semibold">Soroban Contract</h2>
      <div className="mb-4 space-y-2">
        <p className="text-sm text-[var(--color-text-muted)]">
          Status: <span className="font-medium text-white">{status}</span>
        </p>
        {result != null && (
          <p className="text-sm">
            Return value:{" "}
            <span className="font-mono text-[var(--color-success)]">{String(result)}</span>
          </p>
        )}
        {error && (
          <p className="text-sm text-[var(--color-error)]">{error.message}</p>
        )}
      </div>

      <p className="mb-3 text-xs text-[var(--color-text-muted)]">
        Contract: {COUNTER_CONTRACT_ID.slice(0, 12)}...
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => call()}
          disabled={isBusy}
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? "Processing..." : "Increment Counter"}
        </button>
        {status !== "idle" && (
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
