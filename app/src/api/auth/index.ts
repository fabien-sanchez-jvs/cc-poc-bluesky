import ky from "ky";
import { Session } from "./types";
import { getUrl } from "../helper";

export const loginApi = async (user: string, pass: string) => {
  const url = getUrl("bluesky/login");
  const data = {
    user,
    pass,
  };
  try {
    const response = await ky.post<Session>(url, { json: data });
    return response.json();
  } catch (error) {
    console.error({
      url,
      data,
      error,
    });
  }
};
