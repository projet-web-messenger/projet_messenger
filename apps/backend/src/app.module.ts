import { join } from "node:path";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ConversationModule } from "./conversation/conversation.module";
import { MessageModule } from "./message/message.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RabbitMQModule } from "./rabbitmq/rabbitmq.module";
import { UserModule } from "./user/user.module";
import { WebSocketModule } from "./websocket/websocket.module";

@Module({
  imports: [
    PrismaModule,
    RabbitMQModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      playground: true,
      introspection: true,
      plugins: [],
    }),
    UserModule,
    ConversationModule,
    MessageModule,
    RabbitMQModule,
    WebSocketModule,
  ],
})
export class AppModule {}
