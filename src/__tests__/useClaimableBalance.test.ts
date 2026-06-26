/**
 * @file useClaimableBalance.test.ts
 * @description Unit tests for the useClaimableBalance hook.
 * @package stellar-hooks
 * @license MIT
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFreighter } from "../hooks/useFreighter";

// ─── Mock React hooks ─────────────────────────────────────────────────────────

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useCallback: (fn: unknown) => fn,
    useReducer: vi.fn(),
  };
});

// ─── Mock @stellar/stellar-sdk ────────────────────────────────────────────────

vi.mock("@stellar/stellar-sdk", () => ({
  Asset: Object.assign(
    vi.fn().mockImplementation((code: string, issuer: string) => ({ code, issuer })),
    { native: vi.fn().mockReturnValue({ type: "native" }) }
  ),
  Horizon: {
    // Not used directly by useClaimBalance anymore
  },
  Operation: {
    claimClaimableBalance: vi.fn().mockReturnValue({ type: "claimClaimableBalance" }),
  }
}));

// ─── Mock context and dependent hooks ─────────────────────────────────────────

const mockSubmitTx = vi.fn().mockResolvedValue(undefined);
const mockReset = vi.fn();

vi.mock("../hooks/useStellarTransaction", () => ({
  useStellarTransaction: () => ({
    submit: mockSubmitTx,
    reset: mockReset,
    status: "idle",
    hash: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  }),
}));

// ─── Import AFTER mocks ───────────────────────────────────────────────────────

import { useClaimableBalances, useClaimBalance } from "../hooks/useClaimableBalance";
import { useReducer } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockDispatch = vi.fn();

function setupReducer(stateOverride = {}) {
  vi.mocked(useReducer).mockReturnValue([
    {
      balances: [],
      isLoading: false,
      error: null,
      ...stateOverride,
    },
    mockDispatch,
  ] as unknown as ReturnType<typeof useReducer>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useClaimBalance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupReducer();
  });

  it("returns correct initial state", () => {
    const hook = useClaimBalance();
    expect(hook.status).toBe("idle");
    expect(hook.hash).toBeNull();
    expect(hook.error).toBeNull();
    expect(hook.isLoading).toBe(false);
    expect(hook.isSuccess).toBe(false);
    expect(hook.isError).toBe(false);
    expect(typeof hook.claim).toBe("function");
    expect(typeof hook.reset).toBe("function");
  });

  it("calls claimClaimableBalance with the correct balanceId", async () => {
    const { Operation } = await import("@stellar/stellar-sdk");
    const hook = useClaimBalance();
    await hook.claim("balance-id-abc");

    expect(Operation.claimClaimableBalance).toHaveBeenCalledWith({
      balanceId: "balance-id-abc",
    });
    expect(mockSubmitTx).toHaveBeenCalledWith([{ type: "claimClaimableBalance" }]);
  });
});