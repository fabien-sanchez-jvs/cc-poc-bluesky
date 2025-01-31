import { Module } from '@nestjs/common';
import { BlueskyModule } from './bluesky/bluesky.module';

@Module({
  imports: [BlueskyModule],
})
export class AppModule {}
