import { defineConfig } from "tsup";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const hooksDir = join(__dirname, "src/hooks");
const hookFiles = readdirSync(hooksDir)
  .filter((f) => /^use[A-Z].+\.ts$/.test(f) && !f.endsWith(".test.ts"))
  .map((f) => join(hooksDir, f));

export default defineConfig({
  entry: [join(__dirname, "src/index.ts"), ...hookFiles],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  treeshake: true,
  external: [
    "react",
    "@stellar/stellar-sdk",
    "@stellar/stellar-sdk/rpc",
    "@stellar/stellar-sdk/contract",
    "@stellar/freighter-api",
    "@walletconnect/sign-client",
    "@creit-tech/stellar-wallets-kit/sdk",
  ],
});
