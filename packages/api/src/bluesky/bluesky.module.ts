import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BlueskyController } from "./bluesky.controller";
import { BlueskyService } from "./bluesky.service";
import { blueskyConfig } from "./config";

@Module({
  imports: [ConfigModule.forFeature(blueskyConfig)],
  controllers: [BlueskyController],
  providers: [BlueskyService],
})
export class BlueskyModule {}
