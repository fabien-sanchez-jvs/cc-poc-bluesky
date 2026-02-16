export class ConnectUrlResponseEntity {
  url: string;

  constructor(response: { url: string }) {
    this.url = response.url;
  }
}
