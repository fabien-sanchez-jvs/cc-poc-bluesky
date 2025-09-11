import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, randomBytes } from "crypto";
import type { ClientMetadata } from "./types";
import { ClientMetadataEntity, ConnectUrlResponseEntity } from "./entities";
import type { BlueskyConfigType } from "./config";
import { BlueskyClientFactory } from "./blueskyClientFactory";

@Injectable()
export class BlueskyService {
  private readonly logger = new Logger(BlueskyService.name);

  constructor(private readonly configService: ConfigService) {}

  private getConfig(): BlueskyConfigType {
    return this.configService.get<BlueskyConfigType>("bluesky")!;
  }

  generateClientMetadata(): ClientMetadata {
    const config = this.getConfig();

    const metadata: ClientMetadata = {
      client_name: config.clientName,
      client_id: `${config.baseUrl}/bluesky/client-metadata.json`,
      client_uri: config.baseUrl as ClientMetadata["client_uri"],
      redirect_uris: [
        `${config.baseUrl}/bluesky/callback`,
      ] as ClientMetadata["redirect_uris"],
      logo_uri: config.logoUri as ClientMetadata["logo_uri"],
      tos_uri: config.tosUri as ClientMetadata["tos_uri"],
      policy_uri: config.policyUri as ClientMetadata["policy_uri"],
      scope: "atproto transition:generic",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      application_type: "web",
      token_endpoint_auth_method: "none",
      dpop_bound_access_tokens: true,
      subject_type: "public",
      authorization_signed_response_alg: "RS256",
    };

    return metadata;
  }

  getClientMetadata(): ClientMetadataEntity {
    return new ClientMetadataEntity(this.generateClientMetadata());
  }

  /**
   * Génère une URL de connexion OAuth conforme AT Protocol avec PKCE
   * Cette implémentation prépare l'intégration future avec @atproto/oauth-client-node
   */
  async generateConnectUrl(handle: string): Promise<ConnectUrlResponseEntity> {
    this.logger.debug(
      `🛠️ Génération de l'URL de connexion pour le handle: ${handle}`,
    );

    try {
      const metadata = this.generateClientMetadata();
      const factory: BlueskyClientFactory = new BlueskyClientFactory(metadata);
      const client = factory.getClient();
      const url = await client.authorize(handle, {
        scope: "atproto transition:generic",
      });
      return Promise.resolve(
        new ConnectUrlResponseEntity({ url: url.toString() }),
      );
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors de la génération de l'URL de connexion:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Génère les paramètres PKCE pour le flux OAuth (obligatoire selon AT Protocol)
   */
  private generatePKCE(): { codeVerifier: string; codeChallenge: string } {
    // Génération du code verifier (128 caractères aléatoires)
    const codeVerifier = randomBytes(64).toString("base64url");

    // Génération du code challenge (SHA256 du verifier)
    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    this.logger.debug(
      `🔒 PKCE généré - Challenge: ${codeChallenge.substring(0, 10)}...`,
    );

    return { codeVerifier, codeChallenge };
  }

  private generateRandomState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
