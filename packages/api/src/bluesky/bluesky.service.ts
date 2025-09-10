import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { ClientMetadata } from "./types";
import type { BlueskyConfigType } from "./config";

@Injectable()
export class BlueskyService {
  constructor(private readonly configService: ConfigService) {}

  private getConfig(): BlueskyConfigType {
    return this.configService.get<BlueskyConfigType>("bluesky")!;
  }

  generateClientMetadata(): ClientMetadata {
    const config = this.getConfig();

    return {
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
  }
}
