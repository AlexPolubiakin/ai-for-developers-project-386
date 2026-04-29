# Playwright scenarios

These tests run the frontend in a real browser against the NestJS API and PostgreSQL.

Covered scenario:

- Guest opens the public event list, selects `Intro Call`, picks an available date and slot, submits name/email, sees the confirmation screen, and then the owner bookings page shows the persisted booking.

Local preparation:

```bash
cd backend
npx prisma generate
npx prisma db push
npm run seed:e2e

cd ../frontend
npx playwright install chromium
npm run test:e2e
```
