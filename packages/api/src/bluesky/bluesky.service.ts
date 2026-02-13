import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientMetadataEntity, ConnectUrlResponseEntity } from "./entities";
import type { BlueskyConfigType } from "./config";
import { BlueskyStore } from "./blueskyStore";
import {
  JoseKey,
  NodeOAuthClient,
  NodeSavedSessionStore,
  NodeSavedStateStore,
  OAuthClientMetadata,
} from "@atproto/oauth-client-node";

@Injectable()
export class BlueskyService implements OnModuleInit {
  private readonly logger = new Logger(BlueskyService.name);
  private client: NodeOAuthClient | null = null;
  private stateStore: NodeSavedStateStore =
    new BlueskyStore() as unknown as NodeSavedStateStore;
  private sessionStore: NodeSavedSessionStore =
    new BlueskyStore() as unknown as NodeSavedSessionStore;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeOAuthClient();
  }

  private getConfig(): BlueskyConfigType {
    return this.configService.get<BlueskyConfigType>("bluesky")!;
  }
  private async initializeOAuthClient(): Promise<void> {
    try {
      const config = this.getConfig();

      // Vérification des clés privées requises
      if (
        !config.privateKeys?.key1 ||
        !config.privateKeys?.key2 ||
        !config.privateKeys?.key3
      ) {
        throw new Error("Missing required private keys in configuration");
      }

      const keyset = await Promise.all([
        JoseKey.fromImportable(config.privateKeys.key1, "key1"),
        JoseKey.fromImportable(config.privateKeys.key2, "key2"),
        JoseKey.fromImportable(config.privateKeys.key3, "key3"),
      ]);

      this.client = new NodeOAuthClient({
        clientMetadata: this.generateClientMetadata() as OAuthClientMetadata,
        keyset: keyset,
        stateStore: this.stateStore,
        sessionStore: this.sessionStore,
      });

      this.logger.log("OAuth client initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize OAuth client:", error);
      throw error;
    }
  }

  getClientMetadata(): ClientMetadataEntity {
    if (!this.client) {
      throw new Error("OAuth client not initialized");
    }
    return new ClientMetadataEntity(this.client.clientMetadata);
  }

  getJwks(): any {
    if (!this.client) {
      throw new Error("OAuth client not initialized");
    }
    return this.client.jwks;
  }

  generateClientMetadata() {
    const config = this.getConfig();
    const enc = encodeURIComponent;
    const isLocalhost =
      config.baseUrl.includes("localhost") ||
      config.baseUrl.includes("127.0.0.1");
    const finalBaseUrl = config.baseUrl.replace("localhost", "127.0.0.1");

    const metadata = {
      client_name: config.clientName,
      client_id: isLocalhost
        ? `http://localhost?redirect_uri=${enc(`${finalBaseUrl}/bluesky/callback`)}&scope=${enc("atproto transition:generic")}`
        : `${config.baseUrl}/bluesky/client-metadata.json`,
      jwks_uri: `${config.baseUrl}/bluesky/jwks.json`,
      client_uri: finalBaseUrl,
      redirect_uris: [`${finalBaseUrl}/bluesky/callback`],
      logo_uri: config.logoUri,
      tos_uri: config.tosUri,
      policy_uri: config.policyUri,
      scope: "atproto transition:generic",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      application_type: "web",
      token_endpoint_auth_method: "private_key_jwt",
      token_endpoint_auth_signing_alg: "RS256",
      dpop_bound_access_tokens: true,
    };
    this.logger.debug(JSON.stringify(metadata, null, 2));
    return metadata;
  }

  async generateConnectUrl(handle: string): Promise<ConnectUrlResponseEntity> {
    if (!this.client) {
      throw new Error("OAuth client not initialized");
    }

    this.logger.debug(
      `🛠️ Génération de l'URL de connexion pour le handle: ${handle}`,
    );

    try {
      const url = await this.client.authorize(handle, {
        scope: "atproto transition:generic",
      });

      return new ConnectUrlResponseEntity({ url: url.toString() });
    } catch (error) {
      this.logger.error(
        "❌ Erreur lors de la génération de l'URL de connexion:",
        error,
      );
      throw error;
    }
  }
}
