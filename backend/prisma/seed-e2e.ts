import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const ownerId = '11111111-1111-4111-8111-111111111111';
const introCallId = '22222222-2222-4222-8222-222222222222';
const deepDiveId = '33333333-3333-4333-8333-333333333333';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await pool.query('DELETE FROM "Booking"');
  await pool.query('DELETE FROM "EventType"');
  await pool.query('DELETE FROM "ScheduleInterval"');
  await pool.query('DELETE FROM "Owner"');

  const now = new Date('2026-01-01T00:00:00.000Z');

  await pool.query(
    `INSERT INTO "Owner" ("id", "email", "name", "timezone", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $5)`,
    [ownerId, 'owner@example.com', 'Demo Owner', 'Europe/Moscow', now],
  );

  const schedule = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
    { dayOfWeek: 1, startTime: '13:00', endTime: '18:00' },
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 5, startTime: '09:00', endTime: '15:00' },
  ];

  for (const interval of schedule) {
    await pool.query(
      `INSERT INTO "ScheduleInterval" ("id", "ownerId", "dayOfWeek", "startTime", "endTime")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        randomUUID(),
        ownerId,
        interval.dayOfWeek,
        interval.startTime,
        interval.endTime,
      ],
    );
  }

  await pool.query(
    `INSERT INTO "EventType" ("id", "ownerId", "title", "description", "durationMinutes", "createdAt", "updatedAt")
     VALUES
       ($1, $3, 'Intro Call', '30-minute intro call', 30, $4, $4),
       ($2, $3, 'Deep Dive', '60-minute deep dive session', 60, $4, $4)`,
    [introCallId, deepDiveId, ownerId, now],
  );

  console.log('Seeded e2e owner: owner@example.com');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
