import { Inject } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { RabbitmqService } from "src/rabbitmq/rabbitmq.service";
import { PrismaService } from "../prisma/prisma.service";
import { Message } from "./models/message.model";

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    private prisma: PrismaService,
    private rabbitmqService: RabbitmqService,
    @Inject("PUB_SUB") private pubSub: PubSub, // Injectons PubSub pour les notifications en temps réel
  ) {}

  @Mutation(() => Message)
  async sendMessage(
    @Args("senderId") senderId: number,
    // @Args("receiverId") receiverId: number,
    @Args("content") content: string,
    @Args("conversationId") conversationId: number,
  ): Promise<Message> {
    // Vérifions sir le sender fait partie de la conversation
    const userInConversation = await this.prisma.userConversation.findFirst({
      where: {
        userId: senderId,
        conversationId: conversationId,
      },
    });
    if (!userInConversation) {
      throw new Error("Sender is not part of the conversation");
    }

    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        conversationId,
      },
      include: {
        sender: true,
        conversation: {
          include: {
            participants: {
              include: {
                user: true, // Inclure les détails de l'utilisateur
              },
            },
          },
        },
      },
    });

    // Publions dans RabbitMQ
    // await this.rabbitmqService.publishMessage({
    //   type: "nouveau_message",
    //   data: message,
    // });
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    await (this.pubSub as any).publish("messageReceived", {
      messageReceived: message,
    });

    return {
      ...message,
      conversation: message.conversation
        ? {
            ...message.conversation,
            title: message.conversation.title ?? undefined,
            participants: message.conversation.participants.map((p) => p.user),
            messages: [],
          }
        : undefined,
    };
  }
  @Subscription(() => Message, {
    name: "messageReceived",
  })
  messageReceived() {
    // Utilisons PubSub pour les notifications en temps réel
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return (this.pubSub as any).asyncIterableIterator("messageReceived");
  }

  // @Subscription(() => Message, {
  //   name: "messageReceivedInConversation",
  //   filter: (payload, variables) => {
  //     return (
  //       payload.messageReceivedInConversation.conversationId ===
  //       variables.conversationId
  //     );
  //   },
  // })
  // messageReceivedInConversation(
  //   @Args("conversationId") conversationId: number
  // ) {
  //   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  //   return this.pubSub.asyncIterableIterator("messageReceivedInConversation");
  // }

  @Mutation(() => Message)
  async sendDirectMessage(@Args("senderId") senderId: number, @Args("receiverId") receiverId: number, @Args("content") content: string): Promise<Message> {
    //Vérifions si les deux utilisateurs existent
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!sender || !receiver) {
      throw new Error("Le sender ou le receiver n'existe pas");
    }

    //Vérifions si une conversation existe entre les deux utilisateurs
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [senderId, receiverId],
            },
          },
        },
        AND: [
          {
            participants: {
              some: {
                userId: senderId,
              },
            },
          },
          {
            participants: {
              some: {
                userId: receiverId,
              },
            },
          },
        ],
      },
    });

    let conversationId: number;

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      //Créons une nouvelle conversation
      const newConversation = await this.prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId: senderId }, { userId: receiverId }],
          },
        },
      });
      conversationId = newConversation.id;
    }

    //Créons le message
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        conversationId,
      },
      include: {
        sender: true,
        conversation: {
          include: {
            participants: {
              include: {
                user: true, // Inclure les détails de l'utilisateur
              },
            },
          },
        },
      },
    });

    // //Publions l'événement dans PubSub pour les notifications en temps réel
    // await this.pubSub.publish("messageReceived", {
    //   messageReceived: message,
    // });
    // await this.pubSub.publish("messageReceivedInConversation", {
    //   messageReceivedInConversation: message,
    // });

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    await (this.pubSub as any).publish("messageReceived", {
      messageReceived: message,
    });
    return {
      ...message,
      conversation: message.conversation
        ? {
            ...message.conversation,
            title: message.conversation.title ?? undefined,
            participants: message.conversation.participants.map((p) => p.user),
          }
        : undefined,
    };
  }

  @Query(() => [Message])
  async getMessagesBetweenUsers(@Args("user1Id") user1Id: number, @Args("user2Id") user2Id: number): Promise<Message[]> {
    //Trouvons les messages entre les deux utilisateurs
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [user1Id, user2Id],
            },
          },
        },
        AND: [
          {
            participants: {
              some: {
                userId: user1Id,
              },
            },
          },
          {
            participants: {
              some: {
                userId: user2Id,
              },
            },
          },
        ],
      },
    });
    if (!conversation) {
      return []; // Si aucune conversation n'existe, retournons un tableau vide
    }

    // Récupérons les messages de cette conversation
    const messages = this.prisma.message.findMany({
      where: {
        conversationId: conversation.id,
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: true, // Inclure les détails de l'expéditeur
        // conversation: {
        //   include: {
        //     participants: {
        //       include: {
        //         user: true, // Inclure les détails de l'utilisateur
        //       },
      },
    });
    return (await messages).map((message) => ({
      ...message,
      conversation: undefined,
    }));
  }

  @Query(() => [Message])
  async messagesByConversation(@Args("conversationId", { type: () => Int }) conversationId: number): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: true,
      },
    });
  }
}
