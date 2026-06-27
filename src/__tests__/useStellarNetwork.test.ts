import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { StellarProvider } from "../context";
import { useStellarNetwork } from "../hooks/useStellarNetwork";

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(StellarProvider, { network: "testnet" }, children);
}

describe("useStellarNetwork", () => {
  it("returns the current network and config", () => {
    const { result } = renderHook(() => useStellarNetwork(), { wrapper });

    expect(result.current.network).toBe("testnet");
    expect(result.current.networkPassphrase).toBe("Test SDF Network ; September 2015");
    expect(result.current.horizonUrl).toContain("horizon-testnet");
    expect(result.current.sorobanRpcUrl).toContain("soroban-testnet");
  });

  it("setNetwork switches the network without remounting", () => {
    const { result } = renderHook(() => useStellarNetwork(), { wrapper });

    act(() => {
      result.current.setNetwork("mainnet");
    });

    expect(result.current.network).toBe("mainnet");
    expect(result.current.networkPassphrase).toBe(
      "Public Global Stellar Network ; September 2015",
    );
  });

  it("setNetwork accepts a custom network config", () => {
    const { result } = renderHook(() => useStellarNetwork(), { wrapper });

    act(() => {
      result.current.setNetwork("custom", {
        network: "custom",
        horizonUrl: "https://my-horizon.example.com",
        sorobanRpcUrl: "https://my-rpc.example.com",
        networkPassphrase: "My Network ; 2024",
      });
    });

    expect(result.current.network).toBe("custom");
    expect(result.current.networkPassphrase).toBe("My Network ; 2024");
    expect(result.current.horizonUrl).toBe("https://my-horizon.example.com");
  });
});
