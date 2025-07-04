import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Activons CORS pour permettre les requêtes depuis le frontend
  app.enableCors({
    origin: [
      "http://localhost:3001", // ← Frontend Next.js
      "http://localhost:3000", // ← GraphQL Playground
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3000",
    ],
    credentials: true, // Permettre les cookies et les en-têtes d'autorisation
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
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
