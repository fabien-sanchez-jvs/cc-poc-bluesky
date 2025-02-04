import { Body, Controller, Logger, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { BlueskyService } from '@app/bluesky';

@Controller('bluesky')
export class BlueskyController {
  private logger: Logger = new Logger(BlueskyController.name);

  constructor(private readonly bsky: BlueskyService) {}

  @Post('login')
  async login(@Body() { pass, user }: LoginDto) {
    this.logger.verbose(`~login~ user:${user}`);
    return await this.bsky.login(user, pass);
  }
}
