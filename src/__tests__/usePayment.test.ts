/**
 * @file usePayment.test.ts
 * @description Unit tests for the usePayment hook.
 * @package stellar-hooks
 * @license MIT
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock React hooks so they run outside a component ────────────────────────

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useCallback: (fn: unknown) => fn,
    useReducer: (_reducer: unknown, initial: unknown) => [initial, vi.fn()],
  };
});

// ─── Mock @stellar/stellar-sdk ───────────────────────────────────────────────

vi.mock("@stellar/stellar-sdk", () => ({
  Asset: Object.assign(
    vi.fn().mockImplementation((code: string, issuer: string) => ({ type: "credit", code, issuer })),
    {
      native: vi.fn().mockReturnValue({ type: "native" }),
    }
  ),
  Memo: {
    text: vi.fn().mockReturnValue({ type: "text", value: "Thanks!" }),
  },
  Operation: {
    payment: vi.fn().mockReturnValue({ type: "payment" }),
  },
  TransactionBuilder: vi.fn().mockImplementation(() => ({
    // The hook no longer uses this directly
  })),
}));

// ─── Mock context and dependent hooks ────────────────────────────────────────

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

import { usePayment } from "../hooks/usePayment";

// ─── Helper ───────────────────────────────────────────────────────────────────

function getHook(overrides = {}) {
  return usePayment({
    destination: "GDEST...",
    asset: { type: "native" },
    amount: "10",
    ...overrides,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("usePayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the correct initial state", () => {
    const hook = getHook();

    expect(hook.status).toBe("idle");
    expect(hook.hash).toBeNull();
    expect(hook.error).toBeNull();
    expect(hook.isLoading).toBe(false);
    expect(hook.isSuccess).toBe(false);
    expect(hook.isError).toBe(false);
    expect(typeof hook.submit).toBe("function");
    expect(typeof hook.reset).toBe("function");
  });

  it("submits a payment operation via useStellarTransaction", async () => {
    const { Operation } = await import("@stellar/stellar-sdk");
    const hook = getHook();
    await hook.submit();

    expect(Operation.payment).toHaveBeenCalledWith({
      destination: "GDEST...",
      asset: { type: "native" },
      amount: "10",
    });
    expect(mockSubmitTx).toHaveBeenCalledWith([{ type: "payment" }]);
  });

  it("passes options to useStellarTransaction", async () => {
    const { useStellarTransaction } = await import("../hooks/useStellarTransaction");
    getHook({ memo: "test-memo", fee: 200, timeoutSeconds: 30 });
    expect(useStellarTransaction).toHaveBeenCalledWith(expect.objectContaining({ memo: "test-memo", fee: 200, timeoutSeconds: 30 }));
  });

  it("uses Asset.native() for native asset type", async () => {
    const { Asset } = await import("@stellar/stellar-sdk");
    const hook = getHook({ asset: { type: "native" } });
    await hook.submit();

    expect(Asset.native).toHaveBeenCalled();
  });

  it("uses a credit asset when asset type is credit", async () => {
    const { Asset, Operation } = await import("@stellar/stellar-sdk");
    const hook = getHook({
      asset: { type: "credit", code: "USDC", issuer: "GISSUER..." },
    });
    await hook.submit();

    expect(Operation.payment).toHaveBeenCalledWith(expect.objectContaining({
      asset: { type: "credit", code: "USDC", issuer: "GISSUER..." },
    }));
  });
});