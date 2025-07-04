import { graphql } from "@/gql";

export const CREATE_USER = graphql(`
  mutation CreateUser(
    $id: String!
    $email: String
    $displayName: String
    $avatar: String
    $provider: String! = "EMAIL"
  ) {
    createUser(
      id: $id
      email: $email
      displayName: $displayName
      avatar: $avatar
      provider: $provider
    ) {
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
    }
  }
`);

export const UPDATE_USER = graphql(`
  mutation UpdateUser(
    $id: String!
    $email: String
    $displayName: String
    $username: String
    $avatar: String
    $bio: String
    $status: String
  ) {
    updateUser(
      id: $id
      email: $email
      displayName: $displayName
      username: $username
      avatar: $avatar
      bio: $bio
      status: $status
    ) {
      id
      email
      displayName
      username
      avatar
      bio
      status
      updatedAt
    }
  }
`);

export const RESPOND_TO_FRIEND_REQUEST = graphql(`
  mutation RespondToFriendRequest($requestId: String!, $status: String!, $userId: String!) {
    respondToFriendRequest(requestId: $requestId, status: $status, userId: $userId) {
      id
      status
    }
  }
`);

export const CREATE_DIRECT_MESSAGE = graphql(`
  mutation CreateDirectMessage($userId1: String!, $userId2: String!) {
    createDirectMessage(userId1: $userId1, userId2: $userId2) {
      id
    }
  }
`);

export const CREATE_GROUP_CONVERSATION = graphql(`
  mutation CreateConversation($type: String!, $userIds: [String!]!, $description: String, $name: String) {
    createConversation(type: $type, userIds: $userIds, description: $description, name: $name) {
      id
    }
  }
`);

export const REMOVE_FRIEND = graphql(`
  mutation RemoveFriend($friendId: String!, $userId: String!) {
    removeFriend(friendId: $friendId, userId: $userId)
  }
`);

export const SEND_MESSAGE = graphql(`
  mutation SendMessage($content: String!, $conversationId: String!, $senderId: String!) {
    sendMessage(content: $content, conversationId: $conversationId, senderId: $senderId) {
      id
        content
        createdAt
        editedAt
        sender {
          id
          displayName
          username
          avatar
        }
        conversation {
          id
        }
    }
  }
`);

export const EDIT_MESSAGE = graphql(`
  mutation EditMessage($content: String!, $messageId: String!, $userId: String!) {
    editMessage(content: $content, messageId: $messageId, userId: $userId) {
      conversationId
    }
}
`);

export const DELETE_MESSAGE = graphql(`
  mutation DeleteMessage($messageId: String!, $userId: String!) {
    deleteMessage(messageId: $messageId, userId: $userId) {
      conversationId
    }
  }
`);
