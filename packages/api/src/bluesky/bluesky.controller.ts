import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { BlueskyService } from "./bluesky.service";

@Controller("bluesky")
export class BlueskyController {
  constructor(private readonly blueskyService: BlueskyService) {}

  @Get("client-metadata.json")
  getClientMetadata(@Res() res: Response): void {
    const metadata = this.blueskyService.generateClientMetadata();

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(metadata);
  }
}
