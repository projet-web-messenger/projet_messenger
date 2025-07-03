import { gql } from "@apollo/client";

//Sub pour recevoir les nouveaux messages
export const MESSAGE_RECEIVED = gql`
  subscription MessageReceived {
    messageReceived {
      id
      content
      createdAt
      sender {
        id
        name
        email
      }
      conversationId
    }
  }
`;

// Sub pour recevoir les messages d'une conv spécifique
export const MESSAGE_RECEIVED_IN_CONVERSATION = gql`
  subscription MessageReceivedInConversation($conversationId: Float!) {
    messageReceivedInConversation(conversationId: $conversationId) {
      id
      content
      createdAt
      sender {
        id
        name
        email
      }
      conversationId
    }
  }
`;
