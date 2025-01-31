import { Module } from '@nestjs/common';
import { BlueskyController } from './bluesky.controller';
import { BlueskyService } from './bluesky.service';

@Module({
  controllers: [BlueskyController],
  providers: [BlueskyService],
})
export class BlueskyModule {}
