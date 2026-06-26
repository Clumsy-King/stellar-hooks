import type { Metadata } from "next";
import { StellarWalletProvider } from "@/components/stellar-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "stellar-hooks × Next.js",
  description: "A starter dApp built with stellar-hooks and Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StellarWalletProvider>{children}</StellarWalletProvider>
      </body>
    </html>
  );
}
