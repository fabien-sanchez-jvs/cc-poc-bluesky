import { Module } from '@nestjs/common';
import { BlueskyController } from './bluesky.controller';
import { BlueskyModule as BlueskyModuleLib } from '@app/bluesky';

@Module({
  imports: [BlueskyModuleLib],
  controllers: [BlueskyController],
})
export class BlueskyModule {}
