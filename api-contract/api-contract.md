# API Contract

## Назначение

Этот документ фиксирует внешний контракт приложения «Запись на звонок». Проект выполняется в подходе Design First: frontend и backend реализуются по этому контракту и TypeSpec-спецификации из `api-contract/typespec/`.

В MVP нет регистрации и авторизации. Владелец календаря один и заранее задан на стороне backend. Все owner endpoints работают с этим владельцем по умолчанию.

## Доменные сущности

### Owner

Заранее заданный владелец календаря.

| Поле | Тип | Обязательное | Описание |
|------|-----|-------------|----------|
| id | UUID | да | Уникальный идентификатор владельца |
| name | string | да | Отображаемое имя |
| email | string | да | Email владельца |
| timezone | string | да | Таймзона владельца |
| createdAt | datetime | да | Дата создания |
| updatedAt | datetime | да | Дата обновления |

Инварианты:
- owner один для MVP;
- owner не создается через публичный API;
- owner используется по умолчанию во всех `/api/owner/*` endpoints.

---

### EventType

Тип события, который владелец предлагает гостям.

| Поле | Тип | Обязательное | Описание |
|------|-----|-------------|----------|
| id | UUID | да | Уникальный идентификатор |
| ownerId | UUID | да | FK -> Owner |
| title | string | да | Название события |
| description | string | нет | Описание события |
| durationMinutes | int | да | Длительность события в минутах |
| createdAt | datetime | да | Дата создания |
| updatedAt | datetime | да | Дата обновления |

Инварианты:
- `title` не пустой;
- `durationMinutes > 0`;
- создание типа события доступно owner/admin части без auth, потому что owner один.

---

### Slot

Расчетный слот для выбранного типа события.

| Поле | Тип | Обязательное | Описание |
|------|-----|-------------|----------|
| startTime | datetime | да | Начало слота |
| endTime | datetime | да | Конец слота |
| status | enum | да | `free` или `booked` |

Инварианты:
- слоты формируются на ближайшие 14 дней, начиная с текущей даты;
- `endTime - startTime = durationMinutes` выбранного типа события;
- слот не выходит за рамки расписания владельца;
- `booked` означает, что уже есть confirmed booking на тот же `ownerId + startTime`.

---

### Booking

Бронирование гостя.

| Поле | Тип | Обязательное | Описание |
|------|-----|-------------|----------|
| id | UUID | да | Уникальный идентификатор |
| eventTypeId | UUID | да | FK -> EventType |
| ownerId | UUID | да | FK -> Owner |
| startTime | datetime | да | Начало бронирования |
| endTime | datetime | да | Конец бронирования |
| guestName | string | да | Имя гостя |
| guestEmail | string | да | Email гостя |
| status | enum | да | `confirmed` или `cancelled` |
| createdAt | datetime | да | Дата создания |

Инварианты:
- `guestName` не пустой;
- `guestEmail` валидный;
- гость может записаться только на свободный слот из 14-дневного окна;
- на одно время нельзя создать две confirmed записи для одного владельца, даже если выбраны разные типы событий.

---

## Сценарии владельца

### Сценарий 1: Владелец создает тип события

```
Действие:
POST /api/owner/event-types
{
  "title": "Intro Call",
  "description": "30-minute intro call",
  "durationMinutes": 30
}

Результат:
201 Created
{
  "eventType": {
    "id": "uuid",
    "ownerId": "uuid",
    "title": "Intro Call",
    "description": "30-minute intro call",
    "durationMinutes": 30,
    "createdAt": "2026-03-27T11:40:00.000Z",
    "updatedAt": "2026-03-27T11:40:00.000Z"
  }
}

Ошибки:
- 400: title пустой или durationMinutes <= 0
```

### Сценарий 2: Владелец смотрит типы событий

```
Действие:
GET /api/owner/event-types

Результат:
200 OK
{
  "eventTypes": [
    {
      "id": "uuid",
      "ownerId": "uuid",
      "title": "Intro Call",
      "description": "30-minute intro call",
      "durationMinutes": 30,
      "createdAt": "2026-03-27T11:40:00.000Z",
      "updatedAt": "2026-03-27T11:40:00.000Z"
    }
  ]
}
```

### Сценарий 3: Владелец смотрит предстоящие встречи

```
Действие:
GET /api/owner/bookings/upcoming

Результат:
200 OK
{
  "bookings": [
    {
      "id": "uuid",
      "eventTypeId": "uuid",
      "eventTypeTitle": "Intro Call",
      "ownerId": "uuid",
      "startTime": "2026-03-28T06:00:00.000Z",
      "endTime": "2026-03-28T06:30:00.000Z",
      "guestName": "Demo User",
      "guestEmail": "demo@example.com",
      "status": "confirmed",
      "createdAt": "2026-03-27T11:40:00.000Z"
    }
  ]
}
```

Правила:
- возвращаются только будущие confirmed бронирования;
- бронирования всех типов событий идут в одном списке;
- сортировка по `startTime ASC`.

---

## Сценарии гостя

### Сценарий 4: Гость смотрит виды брони

```
Действие:
GET /api/public/event-types

Результат:
200 OK
{
  "owner": {
    "id": "uuid",
    "name": "Demo Owner",
    "timezone": "Europe/Moscow"
  },
  "eventTypes": [
    {
      "id": "uuid",
      "title": "Intro Call",
      "description": "30-minute intro call",
      "durationMinutes": 30
    }
  ]
}
```

### Сценарий 5: Гость смотрит выбранный тип события

```
Действие:
GET /api/public/event-types/{eventTypeId}

Результат:
200 OK
{
  "eventType": {
    "id": "uuid",
    "title": "Intro Call",
    "description": "30-minute intro call",
    "durationMinutes": 30
  }
}

Ошибки:
- 404: тип события не найден
```

### Сценарий 6: Гость смотрит слоты

```
Действие:
GET /api/public/event-types/{eventTypeId}/slots?dateFrom=2026-03-28&dateTo=2026-04-10

Результат:
200 OK
{
  "days": [
    {
      "date": "2026-03-28",
      "freeCount": 17,
      "slots": [
        {
          "startTime": "2026-03-28T06:00:00.000Z",
          "endTime": "2026-03-28T06:30:00.000Z",
          "status": "booked"
        },
        {
          "startTime": "2026-03-28T06:30:00.000Z",
          "endTime": "2026-03-28T07:00:00.000Z",
          "status": "free"
        }
      ]
    }
  ]
}

Ошибки:
- 400: невалидный диапазон дат
- 404: тип события не найден
```

Правила:
- backend ограничивает `dateTo` значением `today + 14 days`;
- гость не может забронировать слот вне возвращенного окна;
- занятые слоты возвращаются для отображения, но недоступны для бронирования.

### Сценарий 7: Гость создает бронирование

```
Действие:
POST /api/public/bookings
{
  "eventTypeId": "uuid",
  "startTime": "2026-03-28T06:30:00.000Z",
  "guestName": "Demo User",
  "guestEmail": "demo@example.com"
}

Результат:
201 Created
{
  "booking": {
    "id": "uuid",
    "eventTypeId": "uuid",
    "eventTypeTitle": "Intro Call",
    "ownerId": "uuid",
    "startTime": "2026-03-28T06:30:00.000Z",
    "endTime": "2026-03-28T07:00:00.000Z",
    "guestName": "Demo User",
    "guestEmail": "demo@example.com",
    "status": "confirmed",
    "createdAt": "2026-03-27T11:40:00.000Z"
  }
}

Ошибки:
- 400: невалидные данные или слот вне окна записи
- 404: тип события не найден
- 409: слот уже занят
```

---

## API Summary

### Owner/Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/owner/event-types` | Список типов событий владельца |
| POST | `/api/owner/event-types` | Создать тип события |
| GET | `/api/owner/bookings/upcoming` | Предстоящие встречи владельца |

### Public

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/public/event-types` | Публичный список видов брони |
| GET | `/api/public/event-types/{eventTypeId}` | Публичная карточка типа события |
| GET | `/api/public/event-types/{eventTypeId}/slots` | Слоты выбранного типа события |
| POST | `/api/public/bookings` | Создать бронирование |

## Генерация слотов

```
1. Получить заранее заданного owner.
2. Найти EventType по eventTypeId.
3. Ограничить диапазон дат окном today ... today + 14 дней.
4. Для каждого дня получить интервалы расписания владельца.
5. Сгенерировать слоты с шагом 30 минут.
6. Для каждого слота посчитать endTime = startTime + durationMinutes.
7. Исключить слоты, которые не помещаются в расписание.
8. Найти confirmed бронирования владельца в диапазоне.
9. Пометить слоты как booked/free.
10. Вернуть список дней со слотами.
```

## Error Responses

### ValidationErrorResponse

```
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "durationMinutes", "message": "Must be greater than 0" }
  ]
}
```

### NotFoundErrorResponse

```
{
  "statusCode": 404,
  "message": "Event type not found"
}
```

### ConflictErrorResponse

```
{
  "statusCode": 409,
  "message": "Slot is already booked"
}
```
