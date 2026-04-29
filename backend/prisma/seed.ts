import "dotenv/config";
import { randomUUID } from "node:crypto";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await pool.query('DELETE FROM "Booking"');
  await pool.query('DELETE FROM "EventType"');
  await pool.query('DELETE FROM "ScheduleInterval"');

  const now = new Date();
  const ownerId = randomUUID();
  const ownerResult = await pool.query<{ id: string }>(
    `INSERT INTO "Owner" ("id", "email", "name", "timezone", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $5)
     ON CONFLICT ("email")
     DO UPDATE SET "name" = EXCLUDED."name", "timezone" = EXCLUDED."timezone", "updatedAt" = EXCLUDED."updatedAt"
     RETURNING "id"`,
    [ownerId, "owner@example.com", "Demo Owner", "Europe/Moscow", now]
  );
  const owner = ownerResult.rows[0];

  const schedule = [
    { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
    { dayOfWeek: 1, startTime: "13:00", endTime: "18:00" },
    { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
    { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
    { dayOfWeek: 4, startTime: "09:00", endTime: "18:00" },
    { dayOfWeek: 5, startTime: "09:00", endTime: "15:00" },
  ];

  for (const interval of schedule) {
    await pool.query(
      `INSERT INTO "ScheduleInterval" ("id", "ownerId", "dayOfWeek", "startTime", "endTime")
       VALUES ($1, $2, $3, $4, $5)`,
      [randomUUID(), owner.id, interval.dayOfWeek, interval.startTime, interval.endTime]
    );
  }

  const eventTypes = [
    {
      title: "Intro Call",
      description: "30-minute intro call",
      durationMinutes: 30,
    },
    {
      title: "Deep Dive",
      description: "60-minute deep dive session",
      durationMinutes: 60,
    },
  ];

  for (const eventType of eventTypes) {
    await pool.query(
      `INSERT INTO "EventType" ("id", "ownerId", "title", "description", "durationMinutes", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $6)`,
      [
        randomUUID(),
        owner.id,
        eventType.title,
        eventType.description,
        eventType.durationMinutes,
        now,
      ]
    );
  }

  console.log("Seeded owner: owner@example.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
