/**
 * @file usePathPayment.test.ts
 * @description Unit tests for the usePathPayment hook.
 * @package stellar-hooks
 * @license MIT
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock React ───────────────────────────────────────────────────────────────

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useCallback: (fn: unknown) => fn,
    useReducer: (_reducer: unknown, initial: unknown) => [initial, vi.fn()],
  };
});

// ─── Mock @stellar/stellar-sdk ────────────────────────────────────────────────

vi.mock("@stellar/stellar-sdk", () => ({
  Asset: Object.assign(
    vi.fn().mockImplementation((code: string, issuer: string) => ({ type: "credit", code, issuer })),
    { native: vi.fn().mockReturnValue({ type: "native" }) }
  ),
  Operation: {
    pathPaymentStrictSend: vi.fn().mockReturnValue({ type: "pathPaymentStrictSend" }),
    pathPaymentStrictReceive: vi.fn().mockReturnValue({ type: "pathPaymentStrictReceive" }),
  }
}));

// ─── Mock context and hooks ───────────────────────────────────────────────────

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

import { usePathPayment } from "../hooks/usePathPayment";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const baseOptions = {
  sendAsset: { type: "native" as const },
  sendAmount: "10",
  destination: "GDEST...",
  destAsset: { type: "credit" as const, code: "USDC", issuer: "GISSUER..." },
  destMin: "9",
};

function getHook(overrides = {}) {
  return usePathPayment({ mode: "strict-send", ...baseOptions, ...overrides });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("usePathPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct initial state", () => {
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

  it("calls pathPaymentStrictSend when mode is strict-send", async () => {
    const { Operation } = await import("@stellar/stellar-sdk");
    const hook = getHook({ mode: "strict-send" });
    await hook.submit();

    expect(Operation.pathPaymentStrictSend).toHaveBeenCalledWith(
      expect.objectContaining({
        sendAmount: "10",
        destination: "GDEST...",
        destMin: "9",
      })
    );
    expect(mockSubmitTx).toHaveBeenCalledWith([{ type: "pathPaymentStrictSend" }]);
    expect(Operation.pathPaymentStrictReceive).not.toHaveBeenCalled();
  });

  it("calls pathPaymentStrictReceive when mode is strict-receive", async () => {
    const { Operation } = await import("@stellar/stellar-sdk");
    const hook = getHook({ mode: "strict-receive" });
    await hook.submit();

    expect(Operation.pathPaymentStrictReceive).toHaveBeenCalledWith(
      expect.objectContaining({
        sendMax: "10",
        destination: "GDEST...",
        destAmount: "9",
      })
    );
    expect(mockSubmitTx).toHaveBeenCalledWith([{ type: "pathPaymentStrictReceive" }]);
    expect(Operation.pathPaymentStrictSend).not.toHaveBeenCalled();
  });

  it("passes options to useStellarTransaction", async () => {
    const { useStellarTransaction } = await import("../hooks/useStellarTransaction");
    const hook = getHook();
    expect(useStellarTransaction).toHaveBeenCalledWith(expect.objectContaining({ fee: 100, timeoutSeconds: 60 }));
  });

  it("uses Asset.native() for native send asset", async () => {
    const { Asset } = await import("@stellar/stellar-sdk");
    const hook = getHook({ sendAsset: { type: "native" } });
    await hook.submit();

    expect(Asset.native).toHaveBeenCalled();
  });

  it("uses Asset constructor for credit dest asset", async () => {
    const { Asset } = await import("@stellar/stellar-sdk");
    const hook = getHook();
    await hook.submit();

    expect(Asset).toHaveBeenCalledWith("USDC", "GISSUER...");
  });

  it("passes intermediate path assets to the operation", async () => {
    const { Operation } = await import("@stellar/stellar-sdk");
    const hook = getHook({
      mode: "strict-send",
      path: [{ type: "credit", code: "XLM2", issuer: "GPATH..." }],
    });
    await hook.submit();

    expect(Operation.pathPaymentStrictSend).toHaveBeenCalledWith(
      expect.objectContaining({
        path: expect.arrayContaining([expect.anything()]),
      })
    );
  });
});