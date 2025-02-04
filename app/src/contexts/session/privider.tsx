import { PropsWithChildren, useState } from "react";
import { SessionContext } from "./context";
import { Session } from "../../api/auth/types";
import { Login } from "../../pages/login";

export function SessionProvider({ children }: PropsWithChildren) {
  const Context = SessionContext;
  const sessionState = useState<Session>();
  const [session] = sessionState;
  return (
    <Context.Provider value={sessionState}>
      {session === undefined ? <Login /> : children}
    </Context.Provider>
  );
}
