import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { BlueskyController } from "./bluesky.controller";
import { BlueskyService } from "./bluesky.service";
import { createMock } from "@golevelup/ts-jest";

describe("BlueskyController", () => {
  let controller: BlueskyController;
  let service: BlueskyService;

  beforeEach(async () => {
    service = createMock<BlueskyService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlueskyController],
      providers: [
        {
          provide: BlueskyService,
          useValue: service,
        },
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
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
