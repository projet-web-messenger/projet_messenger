import { MessageModule } from "@/message/message.module";
import { UserModule } from "@/user/user.module";
import { Module } from "@nestjs/common";
import { ConversationResolver, UserConversationResolver } from "./conversation.resolver";
import { ConversationService } from "./conversation.service";

@Module({
  imports: [MessageModule, UserModule],
  providers: [ConversationResolver, UserConversationResolver, ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
