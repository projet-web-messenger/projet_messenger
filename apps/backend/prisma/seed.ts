import { PrismaClient } from "@prisma/client"; // Adjust the path as necessary

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Démarrage du seeding...");

  // Créer des utilisateurs
  const farid = await prisma.user.create({
    data: {
      email: "farid@mail.com",
      name: "Farid",
    },
  });

  const mody = await prisma.user.create({
    data: {
      email: "mody@mail.com",
      name: "Mody",
    },
  });

  const georgy = await prisma.user.create({
    data: {
      email: "georgy@mail.com",
      name: "Georgy",
    },
  });
  const verdiane = await prisma.user.create({
    data: {
      email: "verdiane@mail.com",
      name: "Verdiane",
    },
  });

  // Créer une conversation entre moi et Mody
  const conversation1 = await prisma.conversation.create({
    data: {
      title: "Farid & Mody",
      participants: {
        create: [{ userId: farid.id }, { userId: mody.id }],
      },
    },
  });

  // Créer une conversation de groupe
  const conversation2 = await prisma.conversation.create({
    data: {
      title: "Groupe de discussion",
      participants: {
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
        content: "Paix sur toi Mody  !!!",
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
    `👥 Utilisateurs créés: ${farid.name}, ${mody.name}, ${georgy.name}, ${verdiane.name} `
  );
  console.log(
    `💬 Conversations créées: ${conversation1.title}, ${conversation2.title}`
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
