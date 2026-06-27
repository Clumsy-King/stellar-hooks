import { renderHook, act } from '@testing-library/react-hooks';
import { useTransactionHistory } from './useTransactionHistory';
import { StellarContext } from '../context';
import { Horizon } from 'stellar-sdk';
import { ReactNode } from 'react';

const mockServer = {
  transactions: jest.fn(),
} as unknown as Horizon.Server;

const mockTransactionsCall = jest.fn();

const wrapper = ({ children }: { children: ReactNode }) => (
  <StellarContext.Provider value={{ server: mockServer, rpc: null, network: 'testnet', networkConfig: {} as any }}>
    {children}
  </StellarContext.Provider>
);

describe('useTransactionHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockServer.transactions as jest.Mock).mockReturnValue({
      forAccount: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      cursor: jest.fn().mockReturnThis(),
      call: mockTransactionsCall,
    });
  });

  const mockPublicKey = 'GCABC...XYZ';

  it('should fetch the initial page of transactions', async () => {
    const mockRecords = [{ id: '1', paging_token: '1' }, { id: '2', paging_token: '2' }];
    mockTransactionsCall.mockResolvedValue({ records: mockRecords });

    const { result, waitForNextUpdate } = renderHook(() => useTransactionHistory(mockPublicKey, { limit: 2 }));

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.transactions).toEqual(mockRecords);
    expect(result.current.hasMore).toBe(true);
    expect(mockTransactionsCall).toHaveBeenCalledTimes(1);
  });

  it('should fetch the next page when fetchNextPage is called', async () => {
    const firstPage = [{ id: '1', paging_token: '100' }];
    const secondPage = [{ id: '2', paging_token: '200' }];
    mockTransactionsCall.mockResolvedValueOnce({ records: firstPage }).mockResolvedValueOnce({ records: secondPage });

    const { result, waitForNextUpdate } = renderHook(() => useTransactionHistory(mockPublicKey, { limit: 1 }));

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.transactions).toEqual(firstPage);
    expect(result.current.hasMore).toBe(true);

    act(() => {
      result.current.fetchNextPage();
    });

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.transactions).toEqual([...firstPage, ...secondPage]);
    expect(mockTransactionsCall).toHaveBeenCalledTimes(2);
  });

  it('should set hasMore to false when the last page is fetched', async () => {
    const mockRecords = [{ id: '1', paging_token: '1' }];
    mockTransactionsCall.mockResolvedValue({ records: mockRecords });

    const { result, waitForNextUpdate } = renderHook(() => useTransactionHistory(mockPublicKey, { limit: 5 }));

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.transactions).toEqual(mockRecords);
    expect(result.current.hasMore).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Network failure');
    mockTransactionsCall.mockRejectedValue(error);

    const { result, waitForNextUpdate } = renderHook(() => useTransactionHistory(mockPublicKey));

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.error).toBe(error);
    expect(result.current.transactions).toEqual([]);
  });
});