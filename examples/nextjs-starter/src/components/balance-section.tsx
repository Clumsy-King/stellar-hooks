"use client";

import { useStellarBalance } from "stellar-hooks";
import type { StellarPublicKey } from "stellar-hooks";

export function BalanceSection({ publicKey }: { publicKey: StellarPublicKey }) {
  const { xlmBalance, balances, isLoading, refetch } = useStellarBalance(publicKey, {
    refetchInterval: 10_000,
  });

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Balances</h2>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition-colors hover:text-white disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>
      {isLoading && !xlmBalance ? (
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">Loading balances...</p>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3">
            <span className="font-medium">XLM</span>
            <span className="font-mono text-sm">{xlmBalance?.balance ?? "—"}</span>
          </div>
          {balances
            .filter((b) => !b.isNative)
            .map((b, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3"
              >
                <span className="font-medium text-sm">{b.assetCode}</span>
                <span className="font-mono text-xs text-[var(--color-text-muted)]">
                  {b.balance}
                </span>
              </div>
            ))}
          {balances.filter((b) => !b.isNative).length === 0 && (
            <p className="text-sm text-[var(--color-text-muted)]">No token balances</p>
          )}
        </div>
      )}
    </section>
  );
}
