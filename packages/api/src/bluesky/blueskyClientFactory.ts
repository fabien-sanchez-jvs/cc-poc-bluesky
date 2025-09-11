import {
  NodeOAuthClient,
  NodeSavedSessionStore,
  NodeSavedStateStore,
} from "@atproto/oauth-client-node";
import { BlueskyStore } from "./blueskyStore";
import { ClientMetadata } from "./types";

export class BlueskyClientFactory {
  constructor(private metadata: ClientMetadata) {}

  getClient() {
    return new NodeOAuthClient({
      clientMetadata: this.metadata,
      stateStore: new BlueskyStore() as unknown as NodeSavedStateStore,
      sessionStore: new BlueskyStore() as unknown as NodeSavedSessionStore,
    });
  }
  // Implementation of the BlueskyClient class
}
