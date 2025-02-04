import { useCallback, useContext } from "react";
import { SessionContext } from "./context";
import { loginApi } from "../../api/auth";

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === null) {
    throw new Error("useSession must be used with Provider");
  }

  const [session, setSession] = context;

  const login = useCallback(async (user: string, password: string) => {
    const response = await loginApi(user, password);
    setSession(response);
  }, [setSession]);

  return { session, login } as const;
};
