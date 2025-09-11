import type { ConnectUrlResponse } from "../types";

export class ConnectUrlResponseEntity implements ConnectUrlResponse {
  url: string;
  state?: string;
  challenge?: string;

  constructor(response: ConnectUrlResponse) {
    this.url = response.url;
    // his.state = response.state;
    // his.challenge = response.challenge;
  }
}
