import { Controller, Get, Header, Logger, Query } from "@nestjs/common";
import { BlueskyService } from "./bluesky.service";
import { ClientMetadataEntity, ConnectUrlResponseEntity } from "./entities";

@Controller("bluesky")
export class BlueskyController {
  private logger = new Logger(BlueskyController.name);
  constructor(private readonly blueskyService: BlueskyService) {}

  @Get("client-metadata.json")
  @Header("Content-Type", "application/json")
  @Header("Access-Control-Allow-Origin", "*")
  getClientMetadata(): ClientMetadataEntity {
    this.logger.verbose(`🔀 [GET] /client-metadata.json`);
    return this.blueskyService.getClientMetadata();
  }

  @Get("url-connect")
  @Header("Content-Type", "application/json")
  @Header("Access-Control-Allow-Origin", "*")
  async getConnectUrl(): Promise<ConnectUrlResponseEntity> {
    this.logger.verbose(`🔀 [GET] /url-connect`);

    // TODO: Modifier cet endpoint pour accepter un handle dans la requête
    // Exemple future: @Query('handle') handle: string
    // Handle fake temporaire - sera remplacé par une donnée de la requête plus tard
    const fakeHandle = "dev-communicity.bsky.social";
    this.logger.debug(`🔧 Utilisation du handle temporaire: ${fakeHandle}`);

    return await this.blueskyService.generateConnectUrl(fakeHandle);
  }

  @Get("callback")
  @Header("Access-Control-Allow-Origin", "*")
  getCallback(@Query() query: string) {
    this.logger.verbose(
      `🔀 [GET] /callback` + (query ? " " + query.toString() : ""),
    );
    throw new Error("Method not implemented.");
  }
}
