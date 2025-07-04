📦 RabbitMQ Queues Structure

👤 User-specific queues:
├── user.{userId}.messages      # New messages in conversations
├── user.{userId}.status        # Friend status updates
├── user.{userId}.typing        # Typing indicators
├── user.{userId}.friends       # Friend requests & acceptances
└── user.{userId}.conversations # Conversation events

💬 Conversation-specific queues:
└── conversation.{conversationId}.events # Conversation history/logging

🔄 Exchanges:
├── messenger.messages      # Message-related events
├── messenger.users         # User status events
├── messenger.conversations # Conversation events
└── messenger.friends       # Friend-related events
