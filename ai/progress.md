# Progress

## Планирование и спецификация

- [x] 1. Создать `ai/` со всеми md-файлами
- [x] 2. Написать `project-mvp-plan.md`
- [x] 3. Написать `api-contract/api-contract.md`
- [x] 4. Написать TypeSpec (`api-contract/typespec/`)

## Инициализация проекта

- [x] 5. Инициализировать `backend/` (NestJS + Prisma + ESLint/Prettier)
- [x] 6. Инициализировать `frontend/` (React + Vite + Mantine + ESLint/Prettier)
- [x] 7. Prisma schema + seed
- [x] 8. Docker Compose (PostgreSQL + backend + frontend)

## Backend

- [ ] 9. Auth модуль (регистрация, логин, JWT, password recovery)
- [ ] 10. Events модуль (CRUD типов событий)
- [ ] 11. Schedule модуль (интервалы по дням)
- [ ] 12. Slots сервис (генерация свободных слотов на 14 дней)
- [ ] 13. Bookings модуль (создание, отмена, список)

## Frontend

- [ ] 14. Auth страницы (Login, Register, Forgot-password, Reset-password)
- [ ] 15. Dashboard — Events (CRUD типов событий)
- [ ] 16. Dashboard — Schedule (редактор расписания по дням)
- [ ] 17. Dashboard — Bookings (список бронирований)
- [ ] 18. Публичные страницы (профиль, календарь, форма бронирования, отмена)

## Тестирование

- [ ] 19. Backend тесты (Unit + Integration)
- [ ] 20. Frontend тесты (Unit + Component)
- [ ] 21. E2E тесты (Playwright)

## CI/CD

- [ ] 22. GitHub Actions (lint + test + build)

## Post-MVP

- [ ] 23. Email-уведомления (Resend)
- [ ] 24. Напоминания (cron-задачи)
