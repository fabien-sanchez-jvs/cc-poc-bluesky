import { Body, Controller, Header, Logger, Post } from "@nestjs/common";
import { BlueskyService } from "./bluesky.service";
import { LoginDto } from "./dtos/login.dto";

@Controller("bluesky")
export class BlueskyController {
  private logger = new Logger(BlueskyController.name);
  constructor(private readonly blueskyService: BlueskyService) {}

  @Post("login")
  @Header("Content-Type", "application/json")
  getClientMetadata(@Body() body: LoginDto) {
    this.logger.verbose(`🔀 [POST] /login`);
    return this.blueskyService.login(body.handle, body.password);
  }
}
