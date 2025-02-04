import { Module } from '@nestjs/common';
import { BlueskyService } from './bluesky.service';
import { BlueskyInterface } from './bluesky.interface';

@Module({
  providers: [BlueskyService, BlueskyInterface],
  exports: [BlueskyService],
})
export class BlueskyModule {}
