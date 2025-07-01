import { join } from "node:path";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { AppController } from "./app.controller";
import { AppResolver } from "./app.resolver";
import { AppService } from "./app.service";
import { ConversationResolver } from "./conversation/conversation.resolver";
import { MessageResolver } from "./message/message.resolver";
import { PrismaModule } from "./prisma/prisma.module";
import { RabbitmqModule } from "./rabbitmq/rabbitmq.module";
import { UserResolver } from "./user/user.resolver";
import { RabbitmqModule } from "./rabbitmq/rabbitmq.module";

@Module({
  imports: [
    RabbitmqModule,
    RabbitmqModule,
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
    }),
  ],
  controllers: [AppController],
  providers: [
    RabbitmqModule,
    AppService,
    AppResolver,
    MessageResolver,
    ConversationResolver,
    UserResolver,
  ],
})
export class AppModule {}
