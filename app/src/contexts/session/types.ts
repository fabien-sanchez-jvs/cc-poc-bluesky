import { Dispatch, SetStateAction } from "react";
import { Session } from "../../api/auth/types";


export type SessionContextState =
  | null
  | [Session | undefined, Dispatch<SetStateAction<Session | undefined>>];
