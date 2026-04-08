import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      passwordHash:
        "$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu6GK",
      name: "Demo User",
      username: "demo",
      timezone: "Europe/Moscow",
      schedule: {
        createMany: {
          data: [
            { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
            { dayOfWeek: 1, startTime: "13:00", endTime: "18:00" },
            { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
            { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
            { dayOfWeek: 4, startTime: "09:00", endTime: "18:00" },
            { dayOfWeek: 5, startTime: "09:00", endTime: "15:00" },
          ],
        },
      },
      eventTypes: {
        createMany: {
          data: [
            {
              name: "Consultation",
              description: "30-minute consultation call",
              slug: "consultation",
              durationMinutes: 30,
              slotInterval: 30,
            },
            {
              name: "Deep Dive",
              description: "60-minute deep dive session",
              slug: "deep-dive",
              durationMinutes: 60,
              slotInterval: 30,
            },
          ],
        },
      },
    },
    include: { schedule: true, eventTypes: true },
  });

  console.log("Seeded user:", user.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
