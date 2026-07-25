import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFreighter } from "../useFreighter";

vi.mock("@stellar/freighter-api", () => ({
  isConnected: vi.fn(),
  isAllowed: vi.fn(),
  getUserInfo: vi.fn(),
  getNetworkDetails: vi.fn(),
  requestAccess: vi.fn(),
  signTransaction: vi.fn(),
  signAuthEntry: vi.fn(),
}));

import * as FreighterApi from "@stellar/freighter-api";

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

describe("useFreighter", () => {
  it("returns isInstalled: false when Freighter is not installed", async () => {
    vi.mocked(FreighterApi.isConnected).mockResolvedValue(false);

    const { result } = renderHook(() => useFreighter());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.publicKey).toBeNull();
  });

  it("returns isConnected: false when not yet allowed", async () => {
    vi.mocked(FreighterApi.isConnected).mockResolvedValue(true);
    vi.mocked(FreighterApi.isAllowed).mockResolvedValue(false);

    const { result } = renderHook(() => useFreighter());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isConnected).toBe(false);
  });

  it("returns publicKey and network when connected and allowed", async () => {
    vi.mocked(FreighterApi.isConnected).mockResolvedValue(true);
    vi.mocked(FreighterApi.isAllowed).mockResolvedValue(true);
    vi.mocked(FreighterApi.getUserInfo).mockResolvedValue({
      publicKey: "GABC123",
    } as any);
    vi.mocked(FreighterApi.getNetworkDetails).mockResolvedValue({
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
    } as any);

    const { result } = renderHook(() => useFreighter());

    await waitFor(() => expect(result.current.isConnected).toBe(true));
    expect(result.current.publicKey).toBe("GABC123");
    expect(result.current.network).toBe("TESTNET");
  });

  it("connect() calls requestAccess and re-checks status", async () => {
    vi.mocked(FreighterApi.isConnected).mockResolvedValue(true);
    vi.mocked(FreighterApi.isAllowed).mockResolvedValue(false);
    vi.mocked(FreighterApi.requestAccess).mockResolvedValue(undefined as any);

    const { result } = renderHook(() => useFreighter());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(FreighterApi.isAllowed).mockResolvedValue(true);
    vi.mocked(FreighterApi.getUserInfo).mockResolvedValue({
      publicKey: "GABC123",
    } as any);
    vi.mocked(FreighterApi.getNetworkDetails).mockResolvedValue({
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
    } as any);

    await act(async () => {
      await result.current.connect();
    });

    expect(FreighterApi.requestAccess).toHaveBeenCalled();
    await waitFor(() => expect(result.current.isConnected).toBe(true));
  });

  it("disconnect() clears publicKey and connected state", async () => {
    vi.mocked(FreighterApi.isConnected).mockResolvedValue(true);
    vi.mocked(FreighterApi.isAllowed).mockResolvedValue(true);
    vi.mocked(FreighterApi.getUserInfo).mockResolvedValue({
      publicKey: "GABC123",
    } as any);
    vi.mocked(FreighterApi.getNetworkDetails).mockResolvedValue({
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
    } as any);

    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    act(() => result.current.disconnect());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.publicKey).toBeNull();
  });
});