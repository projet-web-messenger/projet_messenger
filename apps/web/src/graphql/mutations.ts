import { gql } from "@apollo/client";

//Mutation pr envoyer un msg dans une conversation
export const SEND_MESSAGE = gql`
  mutation SendMessage(
    $senderId: Float!
    $content: String!
    $conversationId: Float!
  ) {
    sendMessage(
      senderId: $senderId
      content: $content
      conversationId: $conversationId
    ) {
      id
      content
      createdAt
      sender {
        id
        name
        email
      }
      conversation {
        id
        title
        participants {
          id
          name
          email
        }
      }
    }
  }
`;

//Mutation pr envoyer un msg direct
export const SEND_DIRECT_MESSAGE = gql`
  mutation SendDirectMessage(
    $senderId: Float!
    $receiverId: Float!
    $content: String!
  ) {
    sendDirectMessage(
      senderId: $senderId
      receiverId: $receiverId
      content: $content
    ) {
      id
      content
      createdAt
      sender {
        id
        name
        email
      }
      conversation {
        id
        title
        participants {
          id
          name
          email
        }
      }
    }
  }
`;
