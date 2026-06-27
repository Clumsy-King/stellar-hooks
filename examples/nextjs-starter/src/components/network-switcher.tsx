"use client";

import { useNetwork } from "stellar-hooks";
import type { StellarNetwork } from "stellar-hooks";

const NETWORKS: { value: StellarNetwork; label: string }[] = [
  { value: "testnet", label: "Testnet" },
  { value: "mainnet", label: "Mainnet" },
  { value: "futurenet", label: "Futurenet" },
];

export function NetworkSwitcher() {
  const { network, networkPassphrase, horizonUrl, sorobanRpcUrl, switchNetwork } =
    useNetwork();

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="mb-4 text-lg font-semibold">Network</h2>
      <div className="flex flex-wrap gap-2">
        {NETWORKS.map((n) => (
          <button
            key={n.value}
            onClick={() => switchNetwork(n.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              network === n.value
                ? "bg-[var(--color-primary)] text-white"
                : "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white"
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-1 text-xs text-[var(--color-text-muted)]">
        <p>Passphrase: {networkPassphrase}</p>
        <p>Horizon: {horizonUrl}</p>
        <p>Soroban RPC: {sorobanRpcUrl}</p>
      </div>
    </section>
  );
}
