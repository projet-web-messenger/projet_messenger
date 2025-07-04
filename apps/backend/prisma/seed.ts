import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generateRandomId(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function main() {
  console.log("🔄 Démarrage du seeding...");

  // Créer des utilisateurs - Use displayName consistently
  const farid = await prisma.user.create({
    data: {
      email: "farid@mail.com",
      displayName: "Farid",
      id: generateRandomId(10),
    },
  });

  const mody = await prisma.user.create({
    data: {
      email: "mody@mail.com",
      displayName: "Mody",
      id: generateRandomId(10),
    },
  });

  const georgy = await prisma.user.create({
    data: {
      email: "georgy@mail.com",
      displayName: "Georgy",
      id: generateRandomId(10),
    },
  });

  const verdiane = await prisma.user.create({
    data: {
      email: "verdiane@mail.com",
      displayName: "Verdiane",
      id: generateRandomId(10),
    },
  });

  // Créer une conversation entre farid et mody
  const conversation1 = await prisma.conversation.create({
    data: {
      name: "Farid & Mody",
      users: {
        create: [{ userId: farid.id }, { userId: mody.id }],
      },
    },
  });

  // Créer une conversation de groupe
  const conversation2 = await prisma.conversation.create({
    data: {
      name: "Groupe de discussion",
      users: {
        create: [
          { userId: farid.id },
          { userId: mody.id },
          { userId: georgy.id },
          { userId: verdiane.id },
        ],
      },
    },
  });

  // Créer des messages
  await prisma.message.createMany({
    data: [
      {
        content: "Paix sur toi Mody !!!",
        senderId: farid.id,
        conversationId: conversation1.id,
      },
      {
        content: "Hello Farid !",
        senderId: mody.id,
        conversationId: conversation1.id,
      },
      {
        content: "Salut tout le monde !",
        senderId: farid.id,
        conversationId: conversation2.id,
      },
      {
        content: "Hey Farid !",
        senderId: mody.id,
        conversationId: conversation2.id,
      },
      {
        content: "Bonjour les amis !",
        senderId: georgy.id,
        conversationId: conversation2.id,
      },
    ],
  });

  console.log("✅ Données de test créées avec succès !");
  console.log(
    `👥 Utilisateurs créés: ${farid.displayName}, ${mody.displayName}, ${georgy.displayName}, ${verdiane.displayName}`
  );
  console.log(
    `💬 Conversations créées: ${conversation1.name}, ${conversation2.name}`
  );
  console.log(`📝 Messages créés: 5 messages`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });