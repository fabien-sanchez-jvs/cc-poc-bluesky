// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SessionUser {}

export interface SessionContextType {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (handle: string, password: string) => Promise<void>;
  logout: () => void;
}
