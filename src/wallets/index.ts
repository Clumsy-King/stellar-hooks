export type { WalletId, WalletAdapter } from "./types";
export { createFreighterAdapter, isFreighterInstalled } from "./freighter";
export { createLobstrAdapter } from "./lobstr";
export { createXBullAdapter } from "./xbull";

import type { WalletAdapter } from "./types";
import { createFreighterAdapter } from "./freighter";
import { createLobstrAdapter } from "./lobstr";
import { createXBullAdapter } from "./xbull";

export function createAllAdapters(): WalletAdapter[] {
  return [createFreighterAdapter(), createLobstrAdapter(), createXBullAdapter()];
}
