# Project MVP Plan

## Обзор

Приложение для бронирования встреч по типу cal.com. Несколько владельцев календарей. Гости бронируют без регистрации. Каждый владелец имеет свой профиль с уникальным username и настраиваемым расписанием.

## Стек

| Слой | Технология |
|------|-----------|
| Frontend | React + Vite + Mantine UI + TypeScript |
| Backend | NestJS + Prisma + TypeScript |
| Database | PostgreSQL |
| Auth | JWT (httpOnly cookie) |
| Testing | Jest, Vitest + Testing Library, Playwright |
| Infra | Docker Compose |

## Роли

### Владелец (Owner)
- Регистрируется с email, паролем, username
- Настраивает расписание (интервалы по дням недели)
- Создаёт типы событий (название, описание, длительность, slug)
- Просматривает список всех бронирований
- Управляет событиями и расписанием из дашборда

### Гость (Guest)
- Без регистрации и авторизации
- Просматривает публичный профиль владельца по `/:username`
- Выбирает тип события
- Смотрит свободные слоты на 14 дней вперёд
- Бронирует слот (имя, email, телефон опционально)
- Отменяет бронирование по ссылке с уникальным токеном

## Доменные сущности

### User
```
id              String    @id @default(uuid())
email           String    @unique
passwordHash    String
name            String
username        String    @unique (3-30 символов, латиница + цифры + дефис, начинается с буквы)
timezone        String    (default: "UTC")
createdAt       DateTime
updatedAt       DateTime
```

### Schedule
```
id              String    @id @default(uuid())
userId          String    (FK → User)
dayOfWeek       Int       (0=Вс, 1=Пн, ..., 6=Сб)
startTime       String    ("09:00")
endTime         String    ("18:00")
```
- Несколько записей на один день (для перерывов)
- Уникальный constraint: `(userId, dayOfWeek, startTime, endTime)`

### EventType
```
id                String    @id @default(uuid())
userId            String    (FK → User)
name              String
description       String?
slug              String    (уникальный в рамках пользователя)
durationMinutes   Int       (по умолчанию 30)
slotInterval      Int       (шаг сетки в минутах, по умолчанию 30)
createdAt         DateTime
updatedAt         DateTime
```
- Составной unique constraint: `(userId, slug)`

### Booking
```
id              String    @id @default(uuid())
eventTypeId     String    (FK → EventType)
userId          String    (FK → User)
startTime       DateTime
endTime         DateTime
guestName       String
guestEmail      String
guestPhone      String?
cancelToken     String    @unique (UUID)
status          BookingStatus (confirmed | cancelled)
cancelledAt     DateTime?
createdAt       DateTime
```

### PasswordReset
```
id              String    @id @default(uuid())
userId          String    (FK → User)
token           String    @unique (UUID)
expiresAt       DateTime
used            Boolean   @default(false)
```

### BookingStatus (enum)
```
confirmed
cancelled
```

## Правила бронирования

1. **Окно бронирования**: слоты формируются на 14 дней вперёд от текущей даты
2. **Занятость**: на одно время нельзя создать две записи, даже если разные типы событий
3. **Генерация слотов**: вычисляются на лету из расписания владельца + длительности события + шага сетки, минус существующие бронирования
4. **Timezone**: таймзона определяется из браузера гостя, гость может переключить вручную. Слоты показываются в выбранной timezone

## URL-схема

### Публичные страницы (гость)
```
/                              — лендинг
/:username                     — профиль владельца, список его типов событий
/:username/:eventSlug          — страница бронирования (календарь + форма)
/cancel/:cancelToken           — страница отмены бронирования
```

### Auth
```
/login                         — вход
/register                      — регистрация
/forgot-password               — запрос сброса пароля
/reset-password?token=xxx      — сброс пароля
```

### Dashboard (владелец)
```
/dashboard                     — дашборд
/dashboard/events              — список типов событий
/dashboard/events/new          — создать тип события
/dashboard/events/:id/edit     — редактировать
/dashboard/schedule            — расписание (интервалы по дням)
/dashboard/bookings            — список бронирований
```

## API-эндпоинты

### Auth
```
POST   /api/auth/register          — регистрация
POST   /api/auth/login             — вход
POST   /api/auth/logout            — выход
POST   /api/auth/forgot-password   — запрос сброса пароля
POST   /api/auth/reset-password    — сброс пароля по токену
GET    /api/auth/me                — текущий пользователь
GET    /api/auth/check-username    — проверка доступности username
```

### Public (гость, без авторизации)
```
GET    /api/public/users/:username/events              — список типов событий
GET    /api/public/users/:username/events/:slug         — тип события по slug
GET    /api/public/slots?username=&eventSlug=&dateFrom=&dateTo=  — свободные слоты
POST   /api/public/bookings                             — создать бронирование
GET    /api/public/bookings/:cancelToken                — информация о бронировании
POST   /api/public/bookings/:cancelToken/cancel         — отменить бронирование
```

### Admin (владелец, JWT)
```
GET    /api/events                 — свои типы событий
POST   /api/events                 — создать
PUT    /api/events/:id             — обновить
DELETE /api/events/:id             — удалить

GET    /api/schedule               — своё расписание
PUT    /api/schedule               — обновить расписание (массив интервалов)

GET    /api/bookings               — список бронирований
GET    /api/bookings/:id           — детали бронирования
```

## Auth — детали реализации

### JWT в httpOnly cookie

```
Access Token:
  - Формат: JWT
  - TTL: 15 минут
  - Хранение: httpOnly cookie (secure, sameSite=strict)
  - Содержимое: { userId, email }

Refresh Token:
  - Формат: JWT
  - TTL: 7 дней
  - Хранение: httpOnly cookie + таблица в БД (для отзыва)
  - При logout — удаляется из БД и очищается cookie
```

### Password Recovery
```
1. POST /api/auth/forgot-password { email }
   → Генерируем resetToken (UUID, TTL 1 час)
   → Сохраняем в PasswordReset
   → Отправляем email (MVP: console.log)
   → Возвращаем 200 (всегда, чтобы не утечь информацию о существовании email)

2. POST /api/auth/reset-password { token, newPassword }
   → Проверяем токен (существует, не протух, не использован)
   → Обновляем passwordHash
   → Помечаем токен как использованный
   → Инвалидируем все refresh token'ы
   → Возвращаем 200
```

### Валидация username
```
GET /api/auth/check-username?username=alex
→ { available: boolean }

Правила:
  - 3-30 символов
  - Латиница, цифры, дефис
  - Начинается с буквы
  - Нельзя использовать зарезервированные: admin, api, public, dashboard, etc.
```

## Структура проекта

```
ai/
  README.md
  progress.md
  sessions.md
  project-mvp-plan.md

api-contract/
  api-contract.md
  typespec/
    main.tsp
    models.tsp
    routes.tsp

frontend/
  src/
    components/
    pages/
      public/
      auth/
      dashboard/
    hooks/
    api/
    utils/
    types/
  tests/
  Dockerfile

backend/
  src/
    modules/
      auth/
      users/
      events/
      schedule/
      bookings/
      slots/
    prisma/
      schema.prisma
      seed.ts
    common/
  tests/
  prisma/
    migrations/
  Dockerfile

docker-compose.yml
```

## Пошаговый план

| # | Задача |
|---|--------|
| 1 | Создать `ai/` со всеми md-файлами |
| 2 | Написать `project-mvp-plan.md` |
| 3 | Написать `specs/api-contract.md` |
| 4 | Написать TypeSpec (`specs/typespec/`) |
| 5 | Инициализировать `backend/` |
| 6 | Инициализировать `frontend/` |
| 7 | Prisma schema + миграции + seed |
| 8 | Docker Compose |
| 9 | Backend: Auth модуль |
| 10 | Backend: Events модуль |
| 11 | Backend: Schedule модуль |
| 12 | Backend: Slots сервис |
| 13 | Backend: Bookings модуль |
| 14 | Frontend: Auth страницы |
| 15 | Frontend: Dashboard — Events |
| 16 | Frontend: Dashboard — Schedule |
| 17 | Frontend: Dashboard — Bookings |
| 18 | Frontend: Публичные страницы |
| 19 | Backend тесты (Unit + Integration) |
| 20 | Frontend тесты (Unit + Component) |
| 21 | E2E тесты (Playwright) |
| 22 | CI (GitHub Actions) |
| 23 | Email-уведомления (Resend) — post-MVP |
