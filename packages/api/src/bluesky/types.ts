import { type OAuthClientMetadata } from "@atproto/oauth-types";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ClientMetadata extends OAuthClientMetadata {}

export interface ConnectUrlResponse {
  url: string;
  state?: string;
  challenge?: string;
}
