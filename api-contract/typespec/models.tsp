using TypeSpec.Http;

model Owner {
  id: string;

  @minLength(1)
  name: string;

  @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
  email: string;

  timezone: string;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

model OwnerPublic {
  id: string;
  name: string;
  timezone: string;
}

model EventType {
  id: string;
  ownerId: string;

  @minLength(1)
  @maxLength(100)
  title: string;

  @maxLength(1000)
  description?: string;

  @minValue(1)
  durationMinutes: int32;

  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

model EventTypePublic {
  id: string;
  title: string;
  description?: string;
  durationMinutes: int32;
}

enum SlotStatus {
  free: "free",
  booked: "booked",
}

model Slot {
  startTime: utcDateTime;
  endTime: utcDateTime;
  status: SlotStatus;
}

model SlotDay {
  @pattern("^\\d{4}-\\d{2}-\\d{2}$")
  date: string;

  @minValue(0)
  freeCount: int32;

  slots: Slot[];
}

enum BookingStatus {
  confirmed: "confirmed",
  cancelled: "cancelled",
}

model Booking {
  id: string;
  eventTypeId: string;
  eventTypeTitle: string;
  ownerId: string;
  startTime: utcDateTime;
  endTime: utcDateTime;

  @minLength(1)
  guestName: string;

  @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
  guestEmail: string;

  status: BookingStatus;
  createdAt: utcDateTime;
}

model CreateEventTypeRequest {
  @minLength(1)
  @maxLength(100)
  title: string;

  @maxLength(1000)
  description?: string;

  @minValue(1)
  durationMinutes: int32;
}

model CreateBookingRequest {
  eventTypeId: string;
  startTime: utcDateTime;

  @minLength(1)
  guestName: string;

  @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
  guestEmail: string;
}

model OwnerEventTypesResponse {
  eventTypes: EventType[];
}

model EventTypeResponse {
  eventType: EventType;
}

model CreatedEventTypeResponse {
  @statusCode statusCode: 201;
  eventType: EventType;
}

model PublicEventTypesResponse {
  owner: OwnerPublic;
  eventTypes: EventTypePublic[];
}

model PublicEventTypeResponse {
  eventType: EventTypePublic;
}

model SlotsResponse {
  days: SlotDay[];
}

model BookingResponse {
  booking: Booking;
}

model CreatedBookingResponse {
  @statusCode statusCode: 201;
  booking: Booking;
}

model BookingsListResponse {
  bookings: Booking[];
}

model FieldError {
  field: string;
  message: string;
}

model ValidationResponse {
  @statusCode statusCode: 400;
  message: string;
  errors: FieldError[];
}

model NotFoundErrorResponse {
  @statusCode statusCode: 404;
  message: string;
}

model ConflictErrorResponse {
  @statusCode statusCode: 409;
  message: string;
  error?: string;
}
