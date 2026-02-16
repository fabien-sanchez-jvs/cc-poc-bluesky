import {
  createContext,
  useCallback,
  useEffect,
  type PropsWithChildren,
} from "react";
import type { SessionContextType, SessionUser } from "./types";
import { LoginForm } from "./LoginForm";
import { useLogin } from "../../hooks/useBlueskyApi";
import { useLocalStorage } from "../../hooks/useLocalStorage";

// eslint-disable-next-line react-refresh/only-export-components
export const SessionContext = createContext<SessionContextType | undefined>(
  undefined,
);

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useLocalStorage<SessionUser | null>("user", null);
  const { send: loginRequest, loading: isLoading , data} = useLogin();

  const login = useCallback(
    async (handle: string, password: string) => {
      try {
        await loginRequest({ handle, password });
      } catch (err) {
        console.error("Login error:", err);
        throw err;
      }
    },
    [loginRequest],
  );

  useEffect(() => {
    console.debug("Login data changed", JSON.stringify(data).substring(0, 25)+"..."); // Log only the first 100 chars for brevity
    if (data) {
      setUser(data); 
    }
  }, [data, setUser]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("session_token");
  }, [setUser]);

  const value: SessionContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
  };

  return (
    <SessionContext.Provider value={value}>
      {value.isAuthenticated ? children : <LoginForm />}
    </SessionContext.Provider>
  );
}
