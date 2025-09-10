import { getConnectUrl } from "../api/bluesky";
import { useRequest } from "./useRequest";

export const useGetConnectUrl = () => {
  return useRequest(getConnectUrl);
};
