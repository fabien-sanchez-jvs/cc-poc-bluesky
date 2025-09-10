import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { ClientMetadata, ConnectUrlResponse } from "./types";
import { ClientMetadataEntity, ConnectUrlResponseEntity } from "./entities";
import type { BlueskyConfigType } from "./config";

@Injectable()
export class BlueskyService {
  constructor(private readonly configService: ConfigService) {}

  private getConfig(): BlueskyConfigType {
    return this.configService.get<BlueskyConfigType>("bluesky")!;
  }

  generateClientMetadata(): ClientMetadataEntity {
    const config = this.getConfig();

    const metadata: ClientMetadata = {
      client_id: `${config.baseUrl}/bluesky/client-metadata.json`,
      client_name: config.clientName,
      client_uri: config.baseUrl,
      logo_uri: config.logoUri,
      tos_uri: config.tosUri,
      policy_uri: config.policyUri,
      redirect_uris: [`${config.baseUrl}/bluesky/callback`],
      scope: config.scope,
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      application_type: config.applicationType,
      token_endpoint_auth_method: config.tokenEndpointAuthMethod,
    };

    return new ClientMetadataEntity(metadata);
  }

  generateConnectUrl(): ConnectUrlResponseEntity {
    const config = this.getConfig();

    // Paramètres OAuth2 pour Bluesky
    const params = new URLSearchParams({
      response_type: "code",
      client_id: `${config.baseUrl}/bluesky/client-metadata.json`,
      redirect_uri: `${config.baseUrl}/bluesky/callback`,
      scope: config.scope,
      state: this.generateRandomState(),
    });

    // URL d'autorisation Bluesky (AT Protocol)
    const authUrl = `https://bsky.social/oauth/authorize?${params.toString()}`;

    const response: ConnectUrlResponse = {
      url: authUrl,
      state: params.get("state") || undefined,
    };

    return new ConnectUrlResponseEntity(response);
  }

  private generateRandomState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
