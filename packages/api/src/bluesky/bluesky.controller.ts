import { Controller, Get, Header } from "@nestjs/common";
import { BlueskyService } from "./bluesky.service";
import { ClientMetadataEntity } from "./entities";

@Controller("bluesky")
export class BlueskyController {
  constructor(private readonly blueskyService: BlueskyService) {}

  @Get("client-metadata.json")
  @Header("Content-Type", "application/json")
  @Header("Access-Control-Allow-Origin", "*")
  getClientMetadata(): ClientMetadataEntity {
    return this.blueskyService.generateClientMetadata();
  }
}
