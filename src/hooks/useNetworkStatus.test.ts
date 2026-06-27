import { renderHook, act } from '@testing-library/react-hooks';
import { useNetworkStatus } from './useNetworkStatus';
import { StellarContext } from '../context';
import { SorobanRpc, Horizon } from 'stellar-sdk';
import { ReactNode } from 'react';

// Mock the SDK servers
const mockHorizon = {
  root: jest.fn(),
} as unknown as Horizon.Server;

const mockRpc = {
  getHealth: jest.fn(),
} as unknown as SorobanRpc.Server;

// A wrapper to provide the mocked context to the hook
const wrapper = ({ children }: { children: ReactNode }) => (
  <StellarContext.Provider value={{ server: mockHorizon, rpc: mockRpc, network: 'testnet', networkConfig: {} as any }}>
    {children}
  </StellarContext.Provider>
);

// Use fake timers to control setInterval
jest.useFakeTimers();

describe('useNetworkStatus', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    (mockHorizon.root as jest.Mock).mockReset();
    (mockRpc.getHealth as jest.Mock).mockReset();
  });

  it('should return healthy status and latency when endpoints are responsive', async () => {
    (mockHorizon.root as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate 50ms latency
      return { history_latest_ledger: 12345 };
    });

    (mockRpc.getHealth as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 75)); // Simulate 75ms latency
      return { status: 'healthy' };
    });

    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus(), { wrapper });

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.isHorizonHealthy).toBe(true);
    expect(result.current.isRpcHealthy).toBe(true);
    expect(result.current.ledger).toBe(12345);
    expect(result.current.horizonLatency).toBeGreaterThanOrEqual(50);
    expect(result.current.rpcLatency).toBeGreaterThanOrEqual(75);
  });

  it('should handle Horizon failure gracefully', async () => {
    (mockHorizon.root as jest.Mock).mockRejectedValue(new Error('Network error'));
    (mockRpc.getHealth as jest.Mock).mockResolvedValue({ status: 'healthy' });

    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus(), { wrapper });

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.isHorizonHealthy).toBe(false);
    expect(result.current.horizonLatency).toBe(Infinity);
    expect(result.current.ledger).toBe(0); // Stays at initial value
    expect(result.current.isRpcHealthy).toBe(true);
  });

  it('should handle Soroban RPC failure gracefully', async () => {
    (mockHorizon.root as jest.Mock).mockResolvedValue({ history_latest_ledger: 12345 });
    (mockRpc.getHealth as jest.Mock).mockRejectedValue(new Error('RPC timeout'));

    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus(), { wrapper });

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.isRpcHealthy).toBe(false);
    expect(result.current.rpcLatency).toBe(Infinity);
    expect(result.current.isHorizonHealthy).toBe(true);
    expect(result.current.ledger).toBe(12345);
  });

  it('should refetch status based on refetchInterval', async () => {
    (mockHorizon.root as jest.Mock).mockResolvedValue({ history_latest_ledger: 100 });
    (mockRpc.getHealth as jest.Mock).mockResolvedValue({ status: 'healthy' });

    const { result, waitForNextUpdate } = renderHook(
      () => useNetworkStatus({ refetchInterval: 5000 }),
      { wrapper }
    );

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(mockHorizon.root).toHaveBeenCalledTimes(1);
    expect(result.current.ledger).toBe(100);

    (mockHorizon.root as jest.Mock).mockResolvedValue({ history_latest_ledger: 101 });

    await act(async () => {
      jest.advanceTimersByTime(5000);
      await waitForNextUpdate();
    });

    expect(mockHorizon.root).toHaveBeenCalledTimes(2);
    expect(result.current.ledger).toBe(101);
  });
});