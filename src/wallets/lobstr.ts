import type { WalletAdapter } from "./types";

interface LobstrApi {
  getPublicKey(): Promise<string>;
  signTransaction(xdr: string): Promise<string>;
}

function getLobstrApi(): LobstrApi | null {
  if (typeof window === "undefined") return null;
  return (window as any).lobstrSignTransaction
    ? {
        getPublicKey: () => (window as any).lobstrGetPublicKey(),
        signTransaction: (xdr: string) => (window as any).lobstrSignTransaction(xdr),
      }
    : null;
}

export function createLobstrAdapter(): WalletAdapter {
  return {
    id: "lobstr",
    name: "Lobstr",

    isInstalled(): boolean {
      return getLobstrApi() !== null;
    },

    async connect(): Promise<string> {
      const api = getLobstrApi();
      if (!api) throw new Error("Lobstr extension is not installed");
      return api.getPublicKey();
    },

    disconnect(): void {},

    async signTransaction(xdr: string): Promise<string> {
      const api = getLobstrApi();
      if (!api) throw new Error("Lobstr extension is not installed");
      return api.signTransaction(xdr);
    },
  };
}
