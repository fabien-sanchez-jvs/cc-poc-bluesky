import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BlueskyModule } from "./bluesky/bluesky.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BlueskyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
