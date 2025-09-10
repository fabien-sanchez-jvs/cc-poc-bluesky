import { useState, useCallback } from "react";
import { apiCache } from "./cache";
import type { UseRequestOptions, UseRequestState } from "./types";

export interface UseRequestReturn<T> extends UseRequestState<T> {
  send: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook simple pour les requêtes sans paramètres
 */
export function useRequest<T>(
  requestFn: () => Promise<T>,
  options?: UseRequestOptions
): UseRequestReturn<T> {
  const [state, setState] = useState<UseRequestState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const send = useCallback(async () => {
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
          [],
          options.cache.ttl
        );
      } else {
        result = await requestFn();
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
  }, [requestFn, options]);

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
