export class ConnectUrlResponseEntity {
  url: string;
  state?: string;
  challenge?: string;

  constructor(response: { url: string; state?: string; challenge?: string }) {
    this.url = response.url;
    // this.state = response.state;
    // this.challenge = response.challenge;
  }
}
