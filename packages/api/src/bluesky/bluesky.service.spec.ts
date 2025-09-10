import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { BlueskyService } from "./bluesky.service";
import type { BlueskyConfigType } from "./config";

describe("BlueskyService", () => {
  let service: BlueskyService;
  let configService: ConfigService;

  const mockConfig: BlueskyConfigType = {
    baseUrl: "http://localhost:3000",
    clientName: "Bluesky POC App",
    logoUri: undefined,
    tosUri: undefined,
    policyUri: undefined,
    scope: "atproto",
    applicationType: "web",
    tokenEndpointAuthMethod: "none",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlueskyService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(mockConfig),
          },
        },
      ],
    }).compile();

    service = module.get<BlueskyService>(BlueskyService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("generateClientMetadata", () => {
    it("should generate client metadata with default values", () => {
      const metadata = service.generateClientMetadata();

      expect(metadata).toEqual({
        client_id: "http://localhost:3000/bluesky/client-metadata.json",
        client_name: "Bluesky POC App",
        client_uri: "http://localhost:3000",
        logo_uri: undefined,
        tos_uri: undefined,
        policy_uri: undefined,
        redirect_uris: ["http://localhost:3000/bluesky/callback"],
        scope: "atproto",
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        application_type: "web",
        token_endpoint_auth_method: "none",
      });

      const getSpy = jest.spyOn(configService, "get");
      expect(getSpy).toHaveBeenCalledWith("bluesky");
    });

    it("should use custom configuration when provided", () => {
      const customConfig: BlueskyConfigType = {
        baseUrl: "https://my-app.com",
        clientName: "My Custom App",
        logoUri: "https://my-app.com/logo.png",
        tosUri: "https://my-app.com/tos",
        policyUri: "https://my-app.com/policy",
        scope: "atproto",
        applicationType: "web",
        tokenEndpointAuthMethod: "none",
      };

      jest.spyOn(configService, "get").mockReturnValue(customConfig);

      const metadata = service.generateClientMetadata();

      expect(metadata.client_id).toBe(
        "https://my-app.com/bluesky/client-metadata.json",
      );
      expect(metadata.client_name).toBe("My Custom App");
      expect(metadata.client_uri).toBe("https://my-app.com");
      expect(metadata.logo_uri).toBe("https://my-app.com/logo.png");
      expect(metadata.tos_uri).toBe("https://my-app.com/tos");
      expect(metadata.policy_uri).toBe("https://my-app.com/policy");
      expect(metadata.redirect_uris).toEqual([
        "https://my-app.com/bluesky/callback",
      ]);
    });
  });
});
