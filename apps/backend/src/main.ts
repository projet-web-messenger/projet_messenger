import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Activons CORS pour permettre les requêtes depuis le frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Remplacez par l'URL de votre frontend
    credentials: true, // Permettre les cookies et les en-têtes d'autorisation
  });

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);

  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log(`🔗 GraphQL Playground: http://localhost:${PORT}/graphql`);
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log(`🔗 WebSocket endpoint: ws://localhost:${PORT}/graphql`);
}

bootstrap();
