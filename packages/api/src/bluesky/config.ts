import { registerAs } from "@nestjs/config";

export interface BlueskyConfigType {
  baseUrl: string;
  clientName: string;
  logoUri?: string;
  tosUri?: string;
  policyUri?: string;
  scope: string;
  applicationType: string;
  tokenEndpointAuthMethod: string;
}

export const blueskyConfig = registerAs(
  "bluesky",
  (): BlueskyConfigType => ({
    baseUrl: process.env.API_URL || "http://127.0.0.1:3000",
    clientName: process.env.BLUESKY_CLIENT_NAME || "Bluesky POC App",
    logoUri: process.env.BLUESKY_LOGO_URI,
    tosUri: process.env.BLUESKY_TOS_URI,
    policyUri: process.env.BLUESKY_POLICY_URI,
    scope: process.env.BLUESKY_SCOPE || "atproto",
    applicationType: process.env.BLUESKY_APPLICATION_TYPE || "web",
    tokenEndpointAuthMethod:
      process.env.BLUESKY_TOKEN_ENDPOINT_AUTH_METHOD || "none",
  }),
);
