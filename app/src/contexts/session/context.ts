import { createContext } from "react";
import { SessionContextState } from "./types";

export const SessionContext = createContext<SessionContextState>(null);
