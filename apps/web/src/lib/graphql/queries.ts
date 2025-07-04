import { graphql } from "@/gql";

export const GET_ALL_USERS = graphql(`
  query AllUsers {
    allUsers {
      id
      avatar
      username
      displayName
      status
    }
  }
`);

export const GET_USER_BY_ID = graphql(`
  query GetUser($id: String!) {
    user(id: $id) {
      id
      email
      displayName
      username
      avatar
      bio
      provider
      status
      createdAt
      updatedAt
      lastSeenAt
    }
  }
`);

export const GET_USER_BY_EMAIL = graphql(`
  query UserByEmail($email: String!) {
    userByEmail(email: $email) {
      id
    }
  }
`);

export const GET_USER_BY_USERNAME = graphql(`
  query UserByUsername($username: String!) {
    userByUsername(username: $username) {
      id
    }
  }
`);

export const GET_FRIENDS = graphql(`
  query Friends($userId: String!) {
    friends(userId: $userId) {
      id
      avatar
      username
      displayName
      status
    }
  }
`);

export const GET_FRIENDS_REQUESTS = graphql(`
  query GetFriendsRequests($userId: String!) {
    friendRequests(userId: $userId) {
      id
      status
      sender {
        id
        displayName
        avatar
      }
    }
  }
`);

export const GET_CONVERSATION = graphql(`
  query Conversation($conversationId: String!) {
    conversation(id: $conversationId) {
      name
      avatar
      type
      users {
        user {
          avatar
          id
          status
          displayName
          username
          createdAt
        }
      }
    }
  }
`);

export const GET_CONVERSATION_WITH_MESSAGES = graphql(`
  query ConversationWithMessages($conversationId: String!) {
    conversation(id: $conversationId) {
      avatar
      name
      description
      type
      
      messages {
        id
        content
        createdAt
        editedAt
        isEdited
        conversationId
        sender {
          id
          avatar
          displayName
        }
      }
      users {
        user {
          displayName
        }
      }
    }
  }
`);

export const GET_USER_CONVERSATIONS = graphql(`
  query UserConversations($userId: String!) {
    userConversations(userId: $userId) {
      conversation {
        id
        name
        avatar
        type
        description
        users {
          user {
            avatar
            id
            status
            displayName
            bio
          }
        }
      }
    }
  }
`);
