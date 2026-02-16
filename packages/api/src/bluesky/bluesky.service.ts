import { AtpAgent } from "@atproto/api";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class BlueskyService {
  private readonly logger = new Logger(BlueskyService.name);

  private agent: AtpAgent;

  constructor(private readonly configService: ConfigService) {
    this.agent = new AtpAgent({
      service: "https://bsky.social",
    });
  }

  async login(handle: string, password: string) {
    const result = await this.agent.login({
      identifier: handle,
      password,
    });
    this.logger.verbose(`✅ Successfully logged in as ${handle}`);
    this.logger.debug(`🔐 Login result: ${JSON.stringify(result)}`);
    return result.data;
  }

  async refresh() {
    try {
      this.agent = new AtpAgent({
        service: "https://bsky.social",
      });
      // TODO: Replace with actual session data from storage
      //       Before create storage
      await this.agent.resumeSession({
        handle: "user.bsky.social",
        accessJwt: "",
        refreshJwt: "",
        active: true,
        did: "",
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`❌ Failed to refresh session: ${error.message}`);
      } else {
        this.logger.error(`❌ Failed to refresh session)}`);
        throw error;
      }
    }
  }
}
