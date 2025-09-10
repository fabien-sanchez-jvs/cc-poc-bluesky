export interface UseRequestState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseRequestOptions {
  cache?: {
    key: string;
    ttl?: number;
  };
}
