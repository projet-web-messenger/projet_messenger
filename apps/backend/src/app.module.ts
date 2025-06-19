import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { GraphQLModule } from "@nestjs/graphql";
import { AppResolver } from "./app.resolver";
import { PrismaModule } from "./prisma/prisma.module";
import { MessageResolver } from "./message/message.resolver";
import { ConversationResolver } from "./conversation/conversation.resolver";
import { UserResolver } from "./user/user.resolver";

@Module({
  imports: [
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppResolver,
    MessageResolver,
    ConversationResolver,
    UserResolver,
  ],
})
export class AppModule {}
