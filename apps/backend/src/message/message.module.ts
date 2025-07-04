import { ConversationModule } from "@/conversation/conversation.module";
import { RabbitmqModule } from "@/rabbitmq/rabbitmq.module";
import { UserModule } from "@/user/user.module";
import { Module, forwardRef } from "@nestjs/common";
import { MessageResolver } from "./message.resolver";
import { MessageService } from "./message.service";

@Module({
  imports: [UserModule, RabbitmqModule, forwardRef(() => ConversationModule)],
  providers: [MessageResolver, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
