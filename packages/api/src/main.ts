import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activer les CORS
  app.enableCors({
    origin: true, // Autorise toutes les origines en développement
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    headers: "Content-Type, Accept",
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error("Error starting the application:", error);
  process.exit(1);
});
