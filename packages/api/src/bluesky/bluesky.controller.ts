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
    return this.blueskyService.generateClientMetadata();
  }

  @Get("url-connect")
  @Header("Content-Type", "application/json")
  @Header("Access-Control-Allow-Origin", "*")
  getConnectUrl(): ConnectUrlResponseEntity {
    this.logger.verbose(`🔀 [GET] /url-connect`);
    return this.blueskyService.generateConnectUrl();
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
