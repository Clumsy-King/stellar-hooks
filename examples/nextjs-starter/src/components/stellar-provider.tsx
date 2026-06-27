"use client";

import { StellarProvider } from "stellar-hooks";
import { STELLAR_NETWORK, CUSTOM_NETWORK_CONFIG } from "@/lib/constants";
import type { ReactNode } from "react";

export function StellarWalletProvider({ children }: { children: ReactNode }) {
  return (
    <StellarProvider network={STELLAR_NETWORK} customConfig={CUSTOM_NETWORK_CONFIG}>
      {children}
    </StellarProvider>
  );
}
