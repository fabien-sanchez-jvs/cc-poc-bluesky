import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHealth(): object {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: "Le serveur fonctionne correctement",
      environment: process.env.NODE_ENV || "development",
    };
  }
}
