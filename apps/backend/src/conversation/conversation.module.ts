import { Module } from "@nestjs/common";
import { MessageModule } from "src/message/message.module";
import { UserModule } from "../user/user.module";
import { ConversationResolver, UserConversationResolver } from "./conversation.resolver";
import { ConversationService } from "./conversation.service";

@Module({
  imports: [MessageModule, UserModule],
  providers: [ConversationResolver, UserConversationResolver, ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
