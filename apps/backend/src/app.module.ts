import { join } from "node:path";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { AppController } from "./app.controller";
import { AppResolver } from "./app.resolver";
import { AppService } from "./app.service";
import { ConversationResolver } from "./conversation/conversation.resolver";
import { MessageResolver } from "./message/message.resolver";
import { PrismaModule } from "./prisma/prisma.module";
import { RabbitmqModule } from "./rabbitmq/rabbitmq.module";
import { UserResolver } from "./user/user.resolver";

@Module({
  imports: [
    RabbitmqModule,
    PrismaModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [RabbitmqModule],
      inject: ["PUB_SUB"],
      useFactory: (pubSub: PubSub): ApolloDriverConfig => ({
        autoSchemaFile: join(process.cwd(), "src/schema.gql"),
        installSubscriptionHandlers: true,
        subscriptions: {
          "graphql-ws": {
            path: "/graphql",
          },
          "subscriptions-transport-ws": {
            path: "/graphql",
          },
        },
        context: ({ req, connection }) => {
          const baseContext = { pubSub };
          if (connection) {
            // Si c'est une connexion WebSocket, on utilise le contexte de la connexion
            return { ...baseContext, req: connection.context };
          }
          // Sinon, on utilise la requête HTTP normale
          return { req, ...baseContext };
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver, MessageResolver, ConversationResolver, UserResolver],
})
export class AppModule {}
