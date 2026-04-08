using TypeSpec.Http;

model User {
  id: string;

  @pattern("^[a-zA-Z][a-zA-Z0-9-]{2,29}$")
  username: string;

  @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
  email: string;

  name: string;
  timezone: string;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

model UserPublic {
  name: string;
  username: string;
}

model ScheduleInterval {
  @minValue(0)
  @maxValue(6)
  dayOfWeek: int32;

  @pattern("^\\d{2}:\\d{2}$")
  startTime: string;

  @pattern("^\\d{2}:\\d{2}$")
  endTime: string;
}

model ScheduleIntervalWithId extends ScheduleInterval {
  id: string;
  userId: string;
}

model EventType {
  id: string;
  userId: string;
  name: string;
  description?: string;

  @pattern("^[a-zA-Z0-9][a-zA-Z0-9-]{1,59}$")
  slug: string;

  @minValue(5)
  durationMinutes: int32;

  @minValue(5)
  slotInterval: int32;

  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

model EventTypePublic {
  name: string;
  slug: string;
  description?: string;
  durationMinutes: int32;
}

enum BookingStatus {
  confirmed: "confirmed",
  cancelled: "cancelled",
}

model Booking {
  id: string;
  eventTypeId: string;
  userId: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  guestName: string;

  @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
  guestEmail: string;

  guestPhone?: string;
  cancelToken: string;
  status: BookingStatus;
  cancelledAt?: utcDateTime;
  createdAt: utcDateTime;
}

model BookingPublic {
  id: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  cancelToken: string;
}

model BookingDetails {
  startTime: utcDateTime;
  endTime: utcDateTime;
  eventTypeName: string;
  ownerName: string;
  status: BookingStatus;
}

model Slot {
  startTime: utcDateTime;
  endTime: utcDateTime;
}

model RegisterRequest {
  @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
  email: string;

  @minLength(8)
  password: string;

  @minLength(1)
  name: string;

  @pattern("^[a-zA-Z][a-zA-Z0-9-]{2,29}$")
  username: string;
}

model LoginRequest {
  @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
  email: string;
  password: string;
}

model ForgotPasswordRequest {
  @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
  email: string;
}

model ResetPasswordRequest {
  token: string;

  @minLength(8)
  newPassword: string;
}

model CreateEventTypeRequest {
  @minLength(1)
  @maxLength(100)
  name: string;

  description?: string;

  @pattern("^[a-zA-Z0-9][a-zA-Z0-9-]{1,59}$")
  slug: string;

  @minValue(5)
  durationMinutes: int32;

  @minValue(5)
  slotInterval: int32;
}

model UpdateEventTypeRequest {
  @minLength(1)
  @maxLength(100)
  name?: string;

  description?: string;

  @minValue(5)
  durationMinutes?: int32;

  @minValue(5)
  slotInterval?: int32;
}

model UpdateScheduleRequest {
  intervals: ScheduleInterval[];
}

model CreateBookingRequest {
  username: string;
  eventSlug: string;
  startTime: utcDateTime;

  @minLength(1)
  guestName: string;

  @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
  guestEmail: string;

  guestPhone?: string;
}

model ErrorResponse {
  statusCode: int32;
  message: string;
  error?: string;
}

model ValidationErrorResponse {
  statusCode: int32;
  message: string;
  errors: FieldError[];
}

model FieldError {
  field: string;
  message: string;
}

model UsernameCheckResponse {
  available: boolean;
}

model AuthResponse {
  user: User;
}

model PublicEventsResponse {
  owner: UserPublic;
  events: EventTypePublic[];
}

model SlotsResponse {
  slots: Slot[];
}

model BookingsListResponse {
  bookings: BookingWithEvent[];
}

model BookingWithEvent {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  eventTypeName: string;
  eventTypeSlug: string;
  status: BookingStatus;
  createdAt: utcDateTime;
}
