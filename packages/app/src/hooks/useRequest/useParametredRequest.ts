import { useState, useCallback } from "react";
import { apiCache } from "./cache";
import type { UseRequestOptions, UseRequestState } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UseParametredRequestReturn<T, P extends any[]>
  extends UseRequestState<T> {
  send: (...params: P) => Promise<void>;
  reset: () => void;
}

/**
 * Hook pour les requêtes avec paramètres
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useParametredRequest<T, P extends any[]>(
  requestFn: (...params: P) => Promise<T>,
  options?: UseRequestOptions,
): UseParametredRequestReturn<T, P> {
  const [state, setState] = useState<UseRequestState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const send = useCallback(
    async (...params: P) => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        let result: T;
        if (options?.cache) {
        // Utilisation du cache
        result = await apiCache.request(
          options.cache.key,
          requestFn,
          params,
          options.cache.ttl
        );
      } else {
        result = await requestFn(...params);
      }
        setState({
          data: result,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    },
    [requestFn, options?.cache],
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    send,
    reset,
  };
}
