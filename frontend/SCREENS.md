# CalClone Frontend Screens

Reference screenshots: `screens/screen1.png` - `screens/screen7.png`.

The frontend is a separate React/Vite/Mantine application. It reads and changes data only through the Design First API contract in `api-contract/`.

## Current MVP Assumptions

- No registration or login in MVP.
- One default owner exists on the backend.
- Owner pages are public for MVP and call `/api/owner/*`.
- Guest pages call `/api/public/*`.
- Event types are addressed by `eventTypeId`, not by `username` or slug.

## Routes

| Route | Screen | API |
| --- | --- | --- |
| `/` | Landing page | none |
| `/events` | Public event type list | `GET /api/public/event-types` |
| `/events/:eventTypeId` | Booking flow | `GET /api/public/event-types/{eventTypeId}`, `GET /api/public/event-types/{eventTypeId}/slots`, `POST /api/public/bookings` |
| `/owner/event-types` | Owner event type list and create form | `GET /api/owner/event-types`, `POST /api/owner/event-types` |
| `/owner/bookings` | Upcoming bookings | `GET /api/owner/bookings/upcoming` |

## Shared Layout

All screens use the same top navigation:

- Logo: calendar mark + `Calendar`.
- `Записаться` links to `/events`.
- `Предстоящие события` links to `/owner/bookings`.

## Screen 7 - Landing `/`

Static hero screen with a blue-to-peach gradient background:

- badge `БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК`;
- title `Calendar`;
- short product description;
- primary CTA `Записаться ->`;
- feature card with fixed 30-minute slots, conflict checks, and upcoming events.

## Public Event Types `/events`

The contract has a public event type list, so the frontend needs a screen between the landing page and the booking flow:

- load `GET /api/public/event-types`;
- show owner name/timezone if available;
- render each event type with title, description, duration;
- event cards link to `/events/:eventTypeId`;
- show loading, error, and empty states.

## Booking Flow `/events/:eventTypeId`

Single route with internal state:

```ts
step: "select-slot" | "guest-form" | "confirmed"
```

### Initial State - Screen 6

- Load event type details.
- Load slots for the next 14 days.
- Show info panel with no selected date or time.
- Calendar is visible.
- Slot panel asks the guest to choose a date.
- Continue button is disabled.

### Date Selected - Screen 2

- Selected date is highlighted.
- Slot panel lists all returned slots for that day.
- `booked` slots are disabled and gray.
- `free` slots are clickable.
- Info panel shows selected date and free count.

### Time Selected - Screen 4

- Selected slot is highlighted.
- Info panel shows selected time.
- Continue button is enabled.

### Guest Form - Screen 5

- Calendar and slot list are replaced by a confirmation form.
- Form fields: guest name and email.
- `Изменить` returns to slot selection.
- Submit calls `POST /api/public/bookings`.
- Handle validation errors and `409 Slot is already booked`.

### Confirmed - Screen 3

- Show success message `Бронь подтверждена. До встречи!`.
- `Забронировать еще` resets the flow and reloads slots.

## Owner Event Types `/owner/event-types`

Owner MVP utility screen:

- load `GET /api/owner/event-types`;
- render event type cards;
- create form with title, optional description, and duration;
- submit to `POST /api/owner/event-types`;
- refresh list after creation.

## Upcoming Bookings `/owner/bookings`

Matches `screens/screen1.png`:

- load `GET /api/owner/bookings/upcoming`;
- render upcoming confirmed bookings sorted by backend;
- show guest name, guest email, event type title, slot time, and created time;
- show empty and error states.

## Component Inventory

- Mantine layout: `Container`, `Group`, `Stack`, `Grid`, `Paper`, `Card`.
- Forms: `TextInput`, `Textarea`, `NumberInput`, `Button`.
- States: `Loader`, `Alert`, `Text`.
- Feedback: `@mantine/notifications`.
- Dates and formatting: `dayjs`.
