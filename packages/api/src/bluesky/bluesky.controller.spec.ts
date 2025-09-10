import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { BlueskyController } from "./bluesky.controller";
import { BlueskyService } from "./bluesky.service";
import { ClientMetadataEntity, ConnectUrlResponseEntity } from "./entities";

describe("BlueskyController", () => {
  let controller: BlueskyController;
  let service: BlueskyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlueskyController],
      providers: [
        BlueskyService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              baseUrl: "http://localhost:3000",
              clientName: "Test App",
              scope: "atproto",
              applicationType: "web",
              tokenEndpointAuthMethod: "none",
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<BlueskyController>(BlueskyController);
    service = module.get<BlueskyService>(BlueskyService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getClientMetadata", () => {
    it("should return client metadata with correct headers", () => {
      const mockMetadata = {
        client_id: "http://localhost:3000/bluesky/client-metadata.json",
        client_name: "Test App",
        client_uri: "http://localhost:3000",
        redirect_uris: ["http://localhost:3000/bluesky/callback"],
        scope: "atproto",
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        application_type: "web",
        token_endpoint_auth_method: "none",
      };

      const mockEntity = new ClientMetadataEntity(mockMetadata);

      jest.spyOn(service, "generateClientMetadata").mockReturnValue(mockEntity);

      const result = controller.getClientMetadata();

      expect(result).toBeInstanceOf(ClientMetadataEntity);
      expect(result.client_id).toBe(mockMetadata.client_id);
      expect(result.client_name).toBe(mockMetadata.client_name);
      expect(result.client_uri).toBe(mockMetadata.client_uri);
      expect(result.redirect_uris).toEqual(mockMetadata.redirect_uris);
      expect(result.scope).toBe(mockMetadata.scope);
      expect(result.grant_types).toEqual(mockMetadata.grant_types);
      expect(result.response_types).toEqual(mockMetadata.response_types);
      expect(result.application_type).toBe(mockMetadata.application_type);
      expect(result.token_endpoint_auth_method).toBe(
        mockMetadata.token_endpoint_auth_method,
      );
    });
  });

  describe("getConnectUrl", () => {
    it("should return connect URL with correct format", () => {
      const mockConnectUrlResponse = {
        url: "https://bsky.social/oauth/authorize?response_type=code&client_id=http://localhost:3000/bluesky/client-metadata.json&redirect_uri=http://localhost:3000/bluesky/callback&scope=atproto&state=abc123",
        state: "abc123",
      };

      const mockEntity = new ConnectUrlResponseEntity(mockConnectUrlResponse);

      jest.spyOn(service, "generateConnectUrl").mockReturnValue(mockEntity);

      const result = controller.getConnectUrl();

      expect(result).toBeInstanceOf(ConnectUrlResponseEntity);
      expect(result.url).toBe(mockConnectUrlResponse.url);
      expect(result.state).toBe(mockConnectUrlResponse.state);
      expect(result.url).toContain("bsky.social/oauth/authorize");
      expect(result.url).toContain("response_type=code");
      expect(result.url).toContain("scope=atproto");
    });
  });
});
