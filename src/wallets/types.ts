export type WalletId = "freighter" | "lobstr" | "xbull";

export interface WalletAdapter {
  id: WalletId;
  name: string;
  isInstalled(): boolean;
  connect(): Promise<string>;
  disconnect(): void;
  signTransaction(xdr: string, opts?: { networkPassphrase?: string }): Promise<string>;
}
