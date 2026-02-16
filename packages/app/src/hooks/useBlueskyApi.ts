import { login } from "../api/bluesky";
import { useParametredRequest } from "./useRequest";

export const useLogin = () => {
  return useParametredRequest(login);
}
