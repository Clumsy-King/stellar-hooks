import { useState, useCallback, useEffect } from 'react';
import { Horizon } from 'stellar-sdk';
import { useStellarContext } from '../context';

export interface UseTransactionHistoryOptions {
  /** The maximum number of records to return. Default: 10. */
  limit?: number;
  /** The order of the records. 'asc' or 'desc'. Default: 'desc'. */
  order?: 'asc' | 'desc';
}

export interface UseTransactionHistoryReturn {
  /** An array of transaction records for the account. */
  transactions: Horizon.TransactionResponse[];
  /** A function to fetch the next page of transactions. */
  fetchNextPage: () => void;
  /** A boolean indicating if there are more transactions to fetch. */
  hasMore: boolean;
  /** A boolean indicating if the hook is currently fetching data. */
  isLoading: boolean;
  /** An error object if the fetch fails. */
  error: Error | null;
}

const DEFAULT_LIMIT = 10;
const DEFAULT_ORDER = 'desc';

/**
 * `useTransactionHistory` is a hook that fetches a paginated list of transactions
 * for a given Stellar account from Horizon.
 *
 * @param {string} publicKey - The public key of the account to fetch history for.
 * @param {UseTransactionHistoryOptions} [options] - Options for the query.
 * @returns {UseTransactionHistoryReturn} An object containing the transaction history and pagination controls.
 */
export function useTransactionHistory(
  publicKey: string,
  options?: UseTransactionHistoryOptions
): UseTransactionHistoryReturn {
  const { server } = useStellarContext();
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const order = options?.order ?? DEFAULT_ORDER;

  const [transactions, setTransactions] = useState<Horizon.TransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [pagingToken, setPagingToken] = useState<string | undefined>(undefined);

  const fetchTransactions = useCallback(
    async (cursor?: string) => {
      if (!publicKey || !server) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await server
          .transactions()
          .forAccount(publicKey)
          .limit(limit)
          .order(order)
          .cursor(cursor)
          .call();

        setTransactions(prev => (cursor ? [...prev, ...response.records] : response.records));

        if (response.records.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
          const lastRecord = response.records[response.records.length - 1];
          setPagingToken(lastRecord.paging_token);
        }
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [publicKey, server, limit, order]
  );

  // Effect for initial fetch and for re-fetching when parameters change
  useEffect(() => {
    setTransactions([]);
    setPagingToken(undefined);
    setHasMore(true);
    fetchTransactions();
  }, [fetchTransactions]);

  const fetchNextPage = useCallback(() => {
    if (!isLoading && hasMore && pagingToken) {
      fetchTransactions(pagingToken);
    }
  }, [isLoading, hasMore, pagingToken, fetchTransactions]);

  return {
    transactions,
    fetchNextPage,
    hasMore,
    isLoading,
    error,
  };
}