/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreateUser(\n    $id: String!\n    $email: String\n    $displayName: String\n    $avatar: String\n    $provider: String! = \"EMAIL\"\n  ) {\n    createUser(\n      id: $id\n      email: $email\n      displayName: $displayName\n      avatar: $avatar\n      provider: $provider\n    ) {\n      id\n      email\n      displayName\n      username\n      avatar\n      bio\n      provider\n      status\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateUserDocument,
    "\n  mutation UpdateUser(\n    $id: String!\n    $email: String\n    $displayName: String\n    $username: String\n    $avatar: String\n    $bio: String\n    $status: String\n  ) {\n    updateUser(\n      id: $id\n      email: $email\n      displayName: $displayName\n      username: $username\n      avatar: $avatar\n      bio: $bio\n      status: $status\n    ) {\n      id\n      email\n      displayName\n      username\n      avatar\n      bio\n      status\n      updatedAt\n    }\n  }\n": typeof types.UpdateUserDocument,
    "\n  mutation RespondToFriendRequest($requestId: String!, $status: String!, $userId: String!) {\n    respondToFriendRequest(requestId: $requestId, status: $status, userId: $userId) {\n      id\n      status\n    }\n  }\n": typeof types.RespondToFriendRequestDocument,
    "\n  mutation CreateDirectMessage($userId1: String!, $userId2: String!) {\n    createDirectMessage(userId1: $userId1, userId2: $userId2) {\n      id\n    }\n  }\n": typeof types.CreateDirectMessageDocument,
    "\n  mutation CreateConversation($type: String!, $userIds: [String!]!, $description: String, $name: String) {\n    createConversation(type: $type, userIds: $userIds, description: $description, name: $name) {\n      id\n    }\n  }\n": typeof types.CreateConversationDocument,
    "\n  mutation RemoveFriend($friendId: String!, $userId: String!) {\n    removeFriend(friendId: $friendId, userId: $userId)\n  }\n": typeof types.RemoveFriendDocument,
    "\n  mutation SendMessage($content: String!, $conversationId: String!, $senderId: String!) {\n    sendMessage(content: $content, conversationId: $conversationId, senderId: $senderId) {\n      id\n        content\n        createdAt\n        editedAt\n        sender {\n          id\n          displayName\n          username\n          avatar\n        }\n        conversation {\n          id\n        }\n    }\n  }\n": typeof types.SendMessageDocument,
    "\n  mutation EditMessage($content: String!, $messageId: String!, $userId: String!) {\n    editMessage(content: $content, messageId: $messageId, userId: $userId) {\n      conversationId\n    }\n}\n": typeof types.EditMessageDocument,
    "\n  mutation DeleteMessage($messageId: String!, $userId: String!) {\n    deleteMessage(messageId: $messageId, userId: $userId) {\n      conversationId\n    }\n  }\n": typeof types.DeleteMessageDocument,
    "\n  query AllUsers {\n    allUsers {\n      id\n      avatar\n      username\n      displayName\n      status\n    }\n  }\n": typeof types.AllUsersDocument,
    "\n  query GetUser($id: String!) {\n    user(id: $id) {\n      id\n      email\n      displayName\n      username\n      avatar\n      bio\n      provider\n      status\n      createdAt\n      updatedAt\n      lastSeenAt\n    }\n  }\n": typeof types.GetUserDocument,
    "\n  query UserByEmail($email: String!) {\n    userByEmail(email: $email) {\n      id\n    }\n  }\n": typeof types.UserByEmailDocument,
    "\n  query Friends($userId: String!) {\n    friends(userId: $userId) {\n      id\n      avatar\n      username\n      displayName\n      status\n    }\n  }\n": typeof types.FriendsDocument,
    "\n  query GetFriendsRequests($userId: String!) {\n    friendRequests(userId: $userId) {\n      id\n      status\n      sender {\n        id\n        displayName\n        avatar\n      }\n    }\n  }\n": typeof types.GetFriendsRequestsDocument,
    "\n  query Conversation($conversationId: String!) {\n    conversation(id: $conversationId) {\n      name\n      avatar\n      type\n      users {\n        user {\n          avatar\n          id\n          status\n          displayName\n        }\n      }\n    }\n  }\n": typeof types.ConversationDocument,
    "\n  query ConversationWithMessages($conversationId: String!) {\n    conversation(id: $conversationId) {\n      avatar\n      name\n      description\n      type\n      \n      messages {\n        id\n        content\n        createdAt\n        editedAt\n        isEdited\n        conversationId\n        sender {\n          id\n          avatar\n          displayName\n        }\n      }\n      users {\n        user {\n          displayName\n        }\n      }\n    }\n  }\n": typeof types.ConversationWithMessagesDocument,
    "\n  query UserConversations($userId: String!) {\n    userConversations(userId: $userId) {\n      conversation {\n        id\n        name\n        avatar\n        type\n        description\n        users {\n          user {\n            avatar\n            id\n            status\n            displayName\n            bio\n          }\n        }\n      }\n    }\n  }\n": typeof types.UserConversationsDocument,
};
const documents: Documents = {
    "\n  mutation CreateUser(\n    $id: String!\n    $email: String\n    $displayName: String\n    $avatar: String\n    $provider: String! = \"EMAIL\"\n  ) {\n    createUser(\n      id: $id\n      email: $email\n      displayName: $displayName\n      avatar: $avatar\n      provider: $provider\n    ) {\n      id\n      email\n      displayName\n      username\n      avatar\n      bio\n      provider\n      status\n      createdAt\n      updatedAt\n    }\n  }\n": types.CreateUserDocument,
    "\n  mutation UpdateUser(\n    $id: String!\n    $email: String\n    $displayName: String\n    $username: String\n    $avatar: String\n    $bio: String\n    $status: String\n  ) {\n    updateUser(\n      id: $id\n      email: $email\n      displayName: $displayName\n      username: $username\n      avatar: $avatar\n      bio: $bio\n      status: $status\n    ) {\n      id\n      email\n      displayName\n      username\n      avatar\n      bio\n      status\n      updatedAt\n    }\n  }\n": types.UpdateUserDocument,
    "\n  mutation RespondToFriendRequest($requestId: String!, $status: String!, $userId: String!) {\n    respondToFriendRequest(requestId: $requestId, status: $status, userId: $userId) {\n      id\n      status\n    }\n  }\n": types.RespondToFriendRequestDocument,
    "\n  mutation CreateDirectMessage($userId1: String!, $userId2: String!) {\n    createDirectMessage(userId1: $userId1, userId2: $userId2) {\n      id\n    }\n  }\n": types.CreateDirectMessageDocument,
    "\n  mutation CreateConversation($type: String!, $userIds: [String!]!, $description: String, $name: String) {\n    createConversation(type: $type, userIds: $userIds, description: $description, name: $name) {\n      id\n    }\n  }\n": types.CreateConversationDocument,
    "\n  mutation RemoveFriend($friendId: String!, $userId: String!) {\n    removeFriend(friendId: $friendId, userId: $userId)\n  }\n": types.RemoveFriendDocument,
    "\n  mutation SendMessage($content: String!, $conversationId: String!, $senderId: String!) {\n    sendMessage(content: $content, conversationId: $conversationId, senderId: $senderId) {\n      id\n        content\n        createdAt\n        editedAt\n        sender {\n          id\n          displayName\n          username\n          avatar\n        }\n        conversation {\n          id\n        }\n    }\n  }\n": types.SendMessageDocument,
    "\n  mutation EditMessage($content: String!, $messageId: String!, $userId: String!) {\n    editMessage(content: $content, messageId: $messageId, userId: $userId) {\n      conversationId\n    }\n}\n": types.EditMessageDocument,
    "\n  mutation DeleteMessage($messageId: String!, $userId: String!) {\n    deleteMessage(messageId: $messageId, userId: $userId) {\n      conversationId\n    }\n  }\n": types.DeleteMessageDocument,
    "\n  query AllUsers {\n    allUsers {\n      id\n      avatar\n      username\n      displayName\n      status\n    }\n  }\n": types.AllUsersDocument,
    "\n  query GetUser($id: String!) {\n    user(id: $id) {\n      id\n      email\n      displayName\n      username\n      avatar\n      bio\n      provider\n      status\n      createdAt\n      updatedAt\n      lastSeenAt\n    }\n  }\n": types.GetUserDocument,
    "\n  query UserByEmail($email: String!) {\n    userByEmail(email: $email) {\n      id\n    }\n  }\n": types.UserByEmailDocument,
    "\n  query Friends($userId: String!) {\n    friends(userId: $userId) {\n      id\n      avatar\n      username\n      displayName\n      status\n    }\n  }\n": types.FriendsDocument,
    "\n  query GetFriendsRequests($userId: String!) {\n    friendRequests(userId: $userId) {\n      id\n      status\n      sender {\n        id\n        displayName\n        avatar\n      }\n    }\n  }\n": types.GetFriendsRequestsDocument,
    "\n  query Conversation($conversationId: String!) {\n    conversation(id: $conversationId) {\n      name\n      avatar\n      type\n      users {\n        user {\n          avatar\n          id\n          status\n          displayName\n        }\n      }\n    }\n  }\n": types.ConversationDocument,
    "\n  query ConversationWithMessages($conversationId: String!) {\n    conversation(id: $conversationId) {\n      avatar\n      name\n      description\n      type\n      \n      messages {\n        id\n        content\n        createdAt\n        editedAt\n        isEdited\n        conversationId\n        sender {\n          id\n          avatar\n          displayName\n        }\n      }\n      users {\n        user {\n          displayName\n        }\n      }\n    }\n  }\n": types.ConversationWithMessagesDocument,
    "\n  query UserConversations($userId: String!) {\n    userConversations(userId: $userId) {\n      conversation {\n        id\n        name\n        avatar\n        type\n        description\n        users {\n          user {\n            avatar\n            id\n            status\n            displayName\n            bio\n          }\n        }\n      }\n    }\n  }\n": types.UserConversationsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateUser(\n    $id: String!\n    $email: String\n    $displayName: String\n    $avatar: String\n    $provider: String! = \"EMAIL\"\n  ) {\n    createUser(\n      id: $id\n      email: $email\n      displayName: $displayName\n      avatar: $avatar\n      provider: $provider\n    ) {\n      id\n      email\n      displayName\n      username\n      avatar\n      bio\n      provider\n      status\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateUser(\n    $id: String!\n    $email: String\n    $displayName: String\n    $avatar: String\n    $provider: String! = \"EMAIL\"\n  ) {\n    createUser(\n      id: $id\n      email: $email\n      displayName: $displayName\n      avatar: $avatar\n      provider: $provider\n    ) {\n      id\n      email\n      displayName\n      username\n      avatar\n      bio\n      provider\n      status\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateUser(\n    $id: String!\n    $email: String\n    $displayName: String\n    $username: String\n    $avatar: String\n    $bio: String\n    $status: String\n  ) {\n    updateUser(\n      id: $id\n      email: $email\n      displayName: $displayName\n      username: $username\n      avatar: $avatar\n      bio: $bio\n      status: $status\n    ) {\n      id\n      email\n      displayName\n      username\n      avatar\n      bio\n      status\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateUser(\n    $id: String!\n    $email: String\n    $displayName: String\n    $username: String\n    $avatar: String\n    $bio: String\n    $status: String\n  ) {\n    updateUser(\n      id: $id\n      email: $email\n      displayName: $displayName\n      username: $username\n      avatar: $avatar\n      bio: $bio\n      status: $status\n    ) {\n      id\n      email\n      displayName\n      username\n      avatar\n      bio\n      status\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RespondToFriendRequest($requestId: String!, $status: String!, $userId: String!) {\n    respondToFriendRequest(requestId: $requestId, status: $status, userId: $userId) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation RespondToFriendRequest($requestId: String!, $status: String!, $userId: String!) {\n    respondToFriendRequest(requestId: $requestId, status: $status, userId: $userId) {\n      id\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateDirectMessage($userId1: String!, $userId2: String!) {\n    createDirectMessage(userId1: $userId1, userId2: $userId2) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation CreateDirectMessage($userId1: String!, $userId2: String!) {\n    createDirectMessage(userId1: $userId1, userId2: $userId2) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateConversation($type: String!, $userIds: [String!]!, $description: String, $name: String) {\n    createConversation(type: $type, userIds: $userIds, description: $description, name: $name) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation CreateConversation($type: String!, $userIds: [String!]!, $description: String, $name: String) {\n    createConversation(type: $type, userIds: $userIds, description: $description, name: $name) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveFriend($friendId: String!, $userId: String!) {\n    removeFriend(friendId: $friendId, userId: $userId)\n  }\n"): (typeof documents)["\n  mutation RemoveFriend($friendId: String!, $userId: String!) {\n    removeFriend(friendId: $friendId, userId: $userId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SendMessage($content: String!, $conversationId: String!, $senderId: String!) {\n    sendMessage(content: $content, conversationId: $conversationId, senderId: $senderId) {\n      id\n        content\n        createdAt\n        editedAt\n        sender {\n          id\n          displayName\n          username\n          avatar\n        }\n        conversation {\n          id\n        }\n    }\n  }\n"): (typeof documents)["\n  mutation SendMessage($content: String!, $conversationId: String!, $senderId: String!) {\n    sendMessage(content: $content, conversationId: $conversationId, senderId: $senderId) {\n      id\n        content\n        createdAt\n        editedAt\n        sender {\n          id\n          displayName\n          username\n          avatar\n        }\n        conversation {\n          id\n        }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation EditMessage($content: String!, $messageId: String!, $userId: String!) {\n    editMessage(content: $content, messageId: $messageId, userId: $userId) {\n      conversationId\n    }\n}\n"): (typeof documents)["\n  mutation EditMessage($content: String!, $messageId: String!, $userId: String!) {\n    editMessage(content: $content, messageId: $messageId, userId: $userId) {\n      conversationId\n    }\n}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteMessage($messageId: String!, $userId: String!) {\n    deleteMessage(messageId: $messageId, userId: $userId) {\n      conversationId\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteMessage($messageId: String!, $userId: String!) {\n    deleteMessage(messageId: $messageId, userId: $userId) {\n      conversationId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AllUsers {\n    allUsers {\n      id\n      avatar\n      username\n      displayName\n      status\n    }\n  }\n"): (typeof documents)["\n  query AllUsers {\n    allUsers {\n      id\n      avatar\n      username\n      displayName\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUser($id: String!) {\n    user(id: $id) {\n      id\n      email\n      displayName\n      username\n      avatar\n      bio\n      provider\n      status\n      createdAt\n      updatedAt\n      lastSeenAt\n    }\n  }\n"): (typeof documents)["\n  query GetUser($id: String!) {\n    user(id: $id) {\n      id\n      email\n      displayName\n      username\n      avatar\n      bio\n      provider\n      status\n      createdAt\n      updatedAt\n      lastSeenAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserByEmail($email: String!) {\n    userByEmail(email: $email) {\n      id\n    }\n  }\n"): (typeof documents)["\n  query UserByEmail($email: String!) {\n    userByEmail(email: $email) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Friends($userId: String!) {\n    friends(userId: $userId) {\n      id\n      avatar\n      username\n      displayName\n      status\n    }\n  }\n"): (typeof documents)["\n  query Friends($userId: String!) {\n    friends(userId: $userId) {\n      id\n      avatar\n      username\n      displayName\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetFriendsRequests($userId: String!) {\n    friendRequests(userId: $userId) {\n      id\n      status\n      sender {\n        id\n        displayName\n        avatar\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetFriendsRequests($userId: String!) {\n    friendRequests(userId: $userId) {\n      id\n      status\n      sender {\n        id\n        displayName\n        avatar\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Conversation($conversationId: String!) {\n    conversation(id: $conversationId) {\n      name\n      avatar\n      type\n      users {\n        user {\n          avatar\n          id\n          status\n          displayName\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Conversation($conversationId: String!) {\n    conversation(id: $conversationId) {\n      name\n      avatar\n      type\n      users {\n        user {\n          avatar\n          id\n          status\n          displayName\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ConversationWithMessages($conversationId: String!) {\n    conversation(id: $conversationId) {\n      avatar\n      name\n      description\n      type\n      \n      messages {\n        id\n        content\n        createdAt\n        editedAt\n        isEdited\n        conversationId\n        sender {\n          id\n          avatar\n          displayName\n        }\n      }\n      users {\n        user {\n          displayName\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ConversationWithMessages($conversationId: String!) {\n    conversation(id: $conversationId) {\n      avatar\n      name\n      description\n      type\n      \n      messages {\n        id\n        content\n        createdAt\n        editedAt\n        isEdited\n        conversationId\n        sender {\n          id\n          avatar\n          displayName\n        }\n      }\n      users {\n        user {\n          displayName\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserConversations($userId: String!) {\n    userConversations(userId: $userId) {\n      conversation {\n        id\n        name\n        avatar\n        type\n        description\n        users {\n          user {\n            avatar\n            id\n            status\n            displayName\n            bio\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query UserConversations($userId: String!) {\n    userConversations(userId: $userId) {\n      conversation {\n        id\n        name\n        avatar\n        type\n        description\n        users {\n          user {\n            avatar\n            id\n            status\n            displayName\n            bio\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;