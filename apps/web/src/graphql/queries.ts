import { gql } from "@apollo/client";

// Query pour récup tous les utilisateurs
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      name
      image
      createdAt
      updatedAt
    }
  }
`;

// Query pour récupérer les messages entre deux utilisateurs
export const GET_MESSAGES_BETWEEN_USERS = gql`
  query GetMessagesBetweenUsers($user1Id: Float!, $user2Id: Float!) {
    getMessagesBetweenUsers(user1Id: $user1Id, user2Id: $user2Id) {
      id
      content
      createdAt
      sender {
        id
        name
        email
      }
    }
  }
`;

//Query pour récup les msg d'une conversation
export const GET_MESSAGES_BY_CONVERSATION = gql`
  query GetMessagesByConversation($conversationId: Int!) {
    messagesByConversation(conversationId: $conversationId) {
      id
      content
      createdAt
      updatedAt
      sender {
        id
        email
        name
        image
        createdAt
        updatedAt
      }
    }
  }
`;
// Query pour récup ttes les conversations
export const GET_CONVERSATIONS = gql`
  query GetConversations {
    conversations {
      id
      title
      createdAt
      updatedAt
      participants {
        id
        email
        name
        image
        createdAt
        updatedAt
      }
    }
  }
`;

// Query pour récupérer une conversation avec ses participants
export const GET_CONVERSATION_BY_ID = gql`
  query GetConversationById($conversationId: Int!) {
    conversationById(conversationId: $conversationId) {
      id
      title
      participants {
        id
        name
        email
        createdAt
      }
    }
  }
`;
