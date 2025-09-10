import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { BlueskyController } from "./bluesky.controller";
import { BlueskyService } from "./bluesky.service";
import type { Response } from "express";

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
        client_id: "http://localhost:3000/bluesky/client-metadata",
        client_name: "Test App",
        client_uri: "http://localhost:3000",
        redirect_uris: ["http://localhost:3000/bluesky/callback"],
        scope: "atproto",
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        application_type: "web",
        token_endpoint_auth_method: "none",
      };

      jest
        .spyOn(service, "generateClientMetadata")
        .mockReturnValue(mockMetadata);

      const setHeaderSpy = jest.fn();
      const jsonSpy = jest.fn();
      const mockResponse = {
        setHeader: setHeaderSpy,
        json: jsonSpy,
      } as unknown as Response;

      controller.getClientMetadata(mockResponse);

      expect(setHeaderSpy).toHaveBeenCalledWith(
        "Content-Type",
        "application/json",
      );
      expect(setHeaderSpy).toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "*",
      );
      expect(jsonSpy).toHaveBeenCalledWith(mockMetadata);
    });
  });
});
