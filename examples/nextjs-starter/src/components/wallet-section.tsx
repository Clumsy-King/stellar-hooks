"use client";

import { useFreighter } from "stellar-hooks";

export function WalletSection() {
  const {
    isInstalled,
    isConnected,
    publicKey,
    isLoading,
    error,
    networkPassphraseMismatch,
    networkPassphraseWarning,
    connect,
    disconnect,
  } = useFreighter();

  if (!isInstalled) {
    return (
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-2 text-lg font-semibold">Wallet</h2>
        <p className="text-[var(--color-warning)]">
          Freighter wallet not detected.{" "}
          <a
            href="https://freighter.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white"
          >
            Install Freighter
          </a>{" "}
          to connect.
        </p>
      </section>
    );
  }

  if (!isConnected) {
    return (
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-4 text-lg font-semibold">Wallet</h2>
        <button
          onClick={connect}
          disabled={isLoading}
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Connecting..." : "Connect Freighter"}
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="mb-2 text-lg font-semibold">Wallet</h2>
          <p className="text-sm text-[var(--color-success)]">Connected</p>
          <p className="mt-1 break-all font-mono text-xs text-[var(--color-text-muted)]">
            {publicKey}
          </p>
          {networkPassphraseMismatch && networkPassphraseWarning && (
            <p className="mt-2 text-sm text-[var(--color-warning)]">
              {networkPassphraseWarning}
            </p>
          )}
        </div>
        <button
          onClick={disconnect}
          className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-error)] hover:text-[var(--color-error)]"
        >
          Disconnect
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-[var(--color-error)]">{error.message}</p>
      )}
    </section>
  );
}
