"use client";

import { useFreighter } from "stellar-hooks";
import { WalletSection } from "@/components/wallet-section";
import { BalanceSection } from "@/components/balance-section";
import { NetworkSwitcher } from "@/components/network-switcher";
import { ContractSection } from "@/components/contract-section";
import { TransactionSection } from "@/components/transaction-section";

export default function Home() {
  const { isConnected, publicKey } = useFreighter();

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">stellar-hooks</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Next.js starter template
        </p>
      </div>

      <NetworkSwitcher />
      <WalletSection />

      {isConnected && publicKey && (
        <>
          <BalanceSection publicKey={publicKey} />
          <ContractSection />
          <TransactionSection />
        </>
      )}

      <footer className="pt-6 text-center text-xs text-[var(--color-text-muted)]">
        Powered by{" "}
        <a
          href="https://github.com/spiffamani/stellar-hooks"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-white"
        >
          stellar-hooks
        </a>
      </footer>
    </main>
  );
}
