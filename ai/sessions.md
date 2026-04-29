# Sessions

## Сессия 1 — 2026-04-08

### Цель
Определить архитектуру, стек, доменные сущности и создать проектную документацию.

### Что сделали
- Определили стек: React + Vite + Mantine / NestJS + Prisma / PostgreSQL
- Выбрали архитектуру: монорепо, несколько владельцев (вариант B), JWT-авторизация
- Определили доменные сущности: User, Schedule, EventType, Booking, PasswordReset
- Спроектировали URL-схему: `/:username/:eventSlug`
- Спроектировали API-эндпоинты (public + auth + admin)
- Создали `ai/README.md`, `ai/progress.md`, `ai/sessions.md`
- Создали `ai/project-mvp-plan.md`
- Создали `api-contract/api-contract.md`
- Создали `api-contract/typespec/` (main.tsp, models.tsp, routes.tsp)

### Решения
- **Prisma вместо TypeORM**: проще для учебного проекта, меньше бойлерплейта, автогенерация типов, Prisma Studio
- **JWT в httpOnly cookie**: защита от XSS, Access Token (15 мин) + Refresh Token (7 дней)
- **Username при регистрации**: пользователь выбирает сам, глобально уникальный, проверка на лету
- **Slug уникальный в рамках владельца**: составной ключ `(userId, slug)`
- **Расписание**: несколько интервалов на день, настраивается из кабинета
- **Отмена бронирования**: гость отменяет по cancelToken (UUID) без авторизации
- **Password recovery**: полный флоу с токеном в БД, email — заглушка на MVP
- **Email**: фаза 1 — только подтверждение на экране, фаза 2 — Resend

### Следующий шаг
Инициализировать `backend/` и `frontend/`, настроить Prisma schema, Docker Compose.

## Сессия 2 — 2026-04-08

### Цель
Инициализировать проект: backend, frontend, Prisma, Docker Compose. Переименовать `specs/` → `api-contract/`.

### Что сделали
- Переименовали `specs/` → `api-contract/` (specs ассоциируется с тестами)
- Инициализировали `backend/`: NestJS + Prisma v7 (с @prisma/adapter-pg) + JWT + passport + cookie-parser
- Инициализировали `frontend/`: React + Vite + Mantine + TanStack Router + Zustand + Axios
- Написали Prisma schema (User, ScheduleInterval, EventType, Booking, PasswordReset, RefreshToken)
- Написали seed-файл с демо-пользователем
- Создали структуру модулей backend: auth, users, events, schedule, bookings, slots
- Создали структуру frontend: api-клиент, типы, pages, hooks, stores
- Написали Dockerfile для backend и frontend (multi-stage)
- Написали docker-compose.yml (PostgreSQL + backend + frontend)
- Оба проекта успешно компилируются

### Решения
- **Prisma v7**: требует `@prisma/adapter-pg` + `pg` для подключения к PostgreSQL. Генерация в `src/generated/`.
- **NestJS global prefix**: `/api` для всех маршрутов, кроме корня
- **ValidationPipe**: whitelist + forbidNonWhitelisted + transform на глобальном уровне
- **CORS**: credentials: true, origin из конфига

### Следующий шаг
Реализовать Auth модуль (регистрация, логин, JWT, password recovery).

## Сессия 3 — 2026-04-29

### Цель
Пересобрать проект под требования Design First шага: без авторизации, с одним заранее заданным владельцем, owner-сценариями и TypeSpec-контрактом как источником правды.

### Что сделали
- Обновили `ai/progress.md` под no-auth MVP с owner/public API.
- Переписали `ai/project-mvp-plan.md` под Design First подход.
- Переписали `api-contract/api-contract.md`: доменные сущности, сценарии владельца и гостя, ограничения бронирования.
- Переписали `api-contract/typespec/models.tsp` и `api-contract/typespec/routes.tsp`.
- Добавили локальные TypeSpec dev-зависимости и npm scripts в `api-contract/package.json`.
- Проверили TypeSpec-компиляцию командой `npm run compile`.

### Решения
- **Владелец без auth**: owner один и заранее задан backend-ом.
- **Owner endpoints**: `/api/owner/event-types` и `/api/owner/bookings/upcoming`.
- **Public endpoints**: `/api/public/event-types`, slots и bookings.
- **Rule of occupancy**: конфликт проверяется по `ownerId + startTime`, независимо от типа события.
- **Auth**: регистрация, JWT и защищенный кабинет перенесены в post-MVP.

### Следующий шаг
Реализовать backend по новому TypeSpec-контракту: owner event types, public event types, slots, bookings и upcoming bookings.

## Сессия 4 — 2026-04-29

### Цель
Реализовать Frontend MVP как отдельное приложение, работающее только через актуальный owner/public API-контракт.

### Что сделали
- Синхронизировали `frontend/SCREENS.md` с no-auth MVP, route scheme и TypeSpec endpoints.
- Переписали frontend-типы и API-клиент под `/api/public/*` и `/api/owner/*`.
- Заменили Vite starter на Mantine-приложение с общим header/layout.
- Реализовали лендинг `/`, список типов событий `/events`, booking flow `/events/:eventTypeId`, owner-форму `/owner/event-types` и список броней `/owner/bookings`.
- Добавили loading/error/empty состояния, disabled состояния для кнопок и обработку ошибок бронирования.
- Проверили frontend командами `npm run lint` и `npm run build`.

### Решения
- **UI stack**: оставили React + Vite + Mantine без shadcn/ui, чтобы не смешивать UI-библиотеки.
- **Routing**: сделали легкий History API router внутри приложения, достаточный для текущего MVP.
- **API source of truth**: frontend использует только endpoints из актуального контракта.

### Следующий шаг
Реализовать backend MVP по тому же контракту и затем прогнать основной сценарий вручную на реальном API или Prism mock.

## Сессия 5 — 2026-04-29

### Цель
Реализовать backend MVP по актуальному TypeSpec-контракту: owner/public API, слоты, бронирование и проверка конфликтов.

### Что сделали
- Упростили Prisma schema под no-auth MVP: `Owner`, `ScheduleInterval`, `EventType`, `Booking`.
- Обновили seed под одного demo owner, рабочее расписание и демо-типы событий.
- Реализовали endpoints `/api/owner/event-types`, `/api/owner/bookings/upcoming`, `/api/public/event-types`, `/api/public/event-types/:eventTypeId`, `/api/public/event-types/:eventTypeId/slots`, `/api/public/bookings`.
- Реализовали генерацию слотов на 14 дней с учетом расписания owner, таймзоны и confirmed bookings.
- Реализовали создание бронирования только на свободный слот и обработку `409 Slot is already booked`.
- Добавили unit-тесты на ключевые правила бронирования.
- Проверили backend командами `npx prisma generate`, `npm run lint`, `npm test`, `npm run build`.

### Решения
- **PostgreSQL вместо in-memory**: оставили стек, уже зафиксированный в проекте и scaffold, чтобы не расходиться с текущей архитектурой.
- **Один owner из БД**: backend берет первого заранее засеянного owner и использует его для всех owner/public сценариев.
- **Конфликт бронирования**: проверяется по `ownerId + startTime`, дополнительно защищен уникальным индексом Prisma.
- **Маршруты NestJS**: контроллеры объявляют пути без префикса `api`, потому что глобальный prefix задается в `main.ts`.

### Следующий шаг
Применить schema к локальной БД, запустить backend/frontend и вручную проверить основной сценарий: создать тип события, выбрать слот, создать бронь и увидеть ее в списке upcoming.
