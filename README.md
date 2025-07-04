# 📬 Projet Messenger

A modern real-time messaging application built with Next.js, NestJS, GraphQL, and RabbitMQ.

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: NestJS, GraphQL, Prisma
- **Database**: PostgreSQL
- **Message Queue**: RabbitMQ
- **Authentication**: Kinde Auth
- **Real-time**: WebSockets + RabbitMQ

---

## 🚀 Quick Start

### Prerequisites

Before you begin, make sure you have:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (package manager)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for databases)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/projet-web-messenger/projet_messenger.git
cd projet_messenger
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create environment files with the required variables:

#### Backend Environment (`apps/backend/.env`)
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"

# RabbitMQ
RABBITMQ_URL="amqp://user:password@localhost:5672"

# Server
PORT=4000
```

#### Frontend Environment (`apps/web/.env.local`)
```env
# Kinde Authentication
KINDE_CLIENT_ID=your_kinde_client_id
KINDE_CLIENT_SECRET=your_kinde_client_secret
KINDE_ISSUER_URL=https://your-domain.kinde.com
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# RabbitMQ (for frontend consumers)
RABBITMQ_URL=amqp://user:password@localhost:5672
```

### 4. Start Services

#### Start Docker Services
```bash
cd apps/backend
docker-compose up -d
```

#### Initialize Database
```bash
# In apps/backend directory
npx prisma generate
npx prisma migrate dev --name init
```

#### Start the Application
```bash
# Return to project root
cd ../..
pnpm dev
```

---

## � Detailed Setup Guide

### Development Workflow

1. **Start Docker services** (PostgreSQL + RabbitMQ):
   ```bash
   cd apps/backend
   docker-compose up -d
   ```

2. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

3. **Start development servers**:
   ```bash
   cd ../..
   pnpm dev
   ```

### Individual Service Commands

#### Backend Only
```bash
cd apps/backend
pnpm dev
```

#### Frontend Only
```bash
cd apps/web
pnpm dev
```

### Database Management

#### View Database
```bash
cd apps/backend
npx prisma studio
```

#### Reset Database
```bash
cd apps/backend
npx prisma migrate reset
```

#### Generate Prisma Client
```bash
cd apps/backend
npx prisma generate
```

---

## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Next.js web application |
| **Backend** | http://localhost:4000 | NestJS API server |
| **GraphQL Playground** | http://localhost:4000/graphql | GraphQL API explorer |
| **Prisma Studio** | http://localhost:5555 | Database management UI |
| **RabbitMQ Management** | http://localhost:15672 | Message queue dashboard |

### Default Credentials

- **RabbitMQ**: `user` / `password`
- **PostgreSQL**: `user` / `pass`

---

## 🔧 Development Tips

### Code Generation
```bash
# Generate GraphQL types for frontend
cd apps/web
pnpm codegen
```

### Linting
```bash
# Lint all projects
pnpm lint

# Lint specific project
cd apps/backend
pnpm lint
```

### Docker Commands
```bash
# View running containers
docker ps

# Stop all services
docker-compose down

# View logs
docker-compose logs

# Rebuild containers
docker-compose up --build
```

---

## 🏗️ Project Structure

```
projet_messenger/
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── src/
│   │   │   ├── message/  # Message management
│   │   │   ├── conversation/ # Conversation logic
│   │   │   ├── user/     # User management
│   │   │   ├── rabbitmq/ # Message queue
│   │   │   └── prisma/   # Database client
│   │   ├── prisma/       # Database schema
│   │   └── docker-compose.yml
│   └── web/              # Next.js frontend
│       ├── src/
│       │   ├── app/      # Next.js app directory
│       │   ├── components/ # React components
│       │   ├── lib/      # Utilities & hooks
│       │   └── providers/ # Context providers
│       └── public/
└── packages/             # Shared packages
```

---

## 🚨 Troubleshooting

### Common Issues

#### Docker Connection Issues
```bash
# Check if Docker is running
docker --version

# Restart Docker containers
cd apps/backend
docker-compose down && docker-compose up -d
```

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Reset database
cd apps/backend
npx prisma migrate reset
```

#### RabbitMQ Connection Issues
```bash
# Check RabbitMQ status
docker ps | grep rabbitmq

# View RabbitMQ logs
docker-compose logs rabbitmq
```

#### Port Conflicts
If you encounter port conflicts, check what's running on each port:
```bash
# Check port usage
lsof -i :3000  # Frontend
lsof -i :4000  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :5672  # RabbitMQ
```

### Getting Help

1. **Check the logs**: Always start by checking the console logs
2. **Verify environment variables**: Ensure all `.env` files are properly configured
3. **Docker status**: Make sure Docker Desktop is running
4. **Port availability**: Ensure required ports are not in use

---

## 📝 Available Scripts

### Root Level
- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all projects
- `pnpm lint` - Lint all projects

### Backend (`apps/backend`)
- `pnpm dev` - Start NestJS server with hot reload
- `pnpm build` - Build the backend
- `pnpm start` - Start production server

### Frontend (`apps/web`)
- `pnpm dev` - Start Next.js with Turbopack
- `pnpm build` - Build the frontend
- `pnpm start` - Start production server
- `pnpm codegen` - Generate GraphQL types

---

## 🎯 Next Steps

After successful setup:

1. **Create your first user** by visiting http://localhost:3000
2. **Explore the GraphQL API** at http://localhost:4000/graphql
3. **Check the database** using Prisma Studio at http://localhost:5555
4. **Monitor message queues** at http://localhost:15672

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.
