export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string; // ISO date string
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  sender: User;
  conversation?: Conversation;
  senderId: string; // Foreign key to User
  conversationId: string;
  user?: User | null; // Optional user relation
}

export interface Conversation {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  participants: User[]; // Many-to-many relation with User
  messages: Message[]; // One-to-many relation with Message
}

export interface SendMessageInput {
  senderId: number;
  conversationId: number;
  content: string;
}

export interface SendDirectMessageInput {
  senderId: number;
  recipientId: number;
  content: string;
}
