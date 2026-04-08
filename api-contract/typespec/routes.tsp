using TypeSpec.Http;

@route("/api/auth")
namespace Auth {
  @post
  @route("/register")
  op register(body: RegisterRequest): AuthResponse | ConflictErrorResponse | ValidationResponse;

  @post
  @route("/login")
  op login(body: LoginRequest): AuthResponse | UnauthorizedErrorResponse | ValidationResponse;

  @post
  @route("/logout")
  op logout(): NoContentResponse;

  @post
  @route("/forgot-password")
  op forgotPassword(body: ForgotPasswordRequest): OkResponse;

  @post
  @route("/reset-password")
  op resetPassword(body: ResetPasswordRequest): OkResponse | BadRequestErrorResponse;

  @get
  @route("/me")
  op me(): AuthResponse | UnauthorizedErrorResponse;

  @get
  @route("/check-username")
  op checkUsername(@query username: string): UsernameCheckResponse | ValidationResponse;
}

@route("/api/public")
namespace Public {
  @get
  @route("/users/{username}/events")
  op getPublicEvents(username: string): PublicEventsResponse | NotFoundErrorResponse;

  @get
  @route("/users/{username}/events/{slug}")
  op getPublicEvent(username: string, slug: string): EventTypePublic | NotFoundErrorResponse;

  @get
  @route("/slots")
  op getSlots(
    @query username: string,
    @query eventSlug: string,
    @query dateFrom: string,
    @query dateTo: string
  ): SlotsResponse | NotFoundErrorResponse | ValidationResponse;

  @post
  @route("/bookings")
  op createBooking(body: CreateBookingRequest): BookingPublic | ConflictErrorResponse | NotFoundErrorResponse | ValidationResponse;

  @get
  @route("/bookings/{cancelToken}")
  op getBookingByCancelToken(cancelToken: string): BookingDetails | NotFoundErrorResponse;

  @post
  @route("/bookings/{cancelToken}/cancel")
  op cancelBooking(cancelToken: string): BookingPublic | NotFoundErrorResponse | BadRequestErrorResponse;
}

@route("/api/events")
namespace Events {
  @get
  op listEvents(): EventType[];

  @post
  op createEvent(body: CreateEventTypeRequest): EventType | ConflictErrorResponse | ValidationResponse;

  @get
  @route("/{id}")
  op getEvent(id: string): EventType | NotFoundErrorResponse;

  @put
  @route("/{id}")
  op updateEvent(id: string, body: UpdateEventTypeRequest): EventType | NotFoundErrorResponse | ValidationResponse;

  @delete
  @route("/{id}")
  op deleteEvent(id: string): NoContentResponse | NotFoundErrorResponse;
}

@route("/api/schedule")
namespace Schedule {
  @get
  op getSchedule(): ScheduleIntervalWithId[];

  @put
  op updateSchedule(body: UpdateScheduleRequest): ScheduleIntervalWithId[] | ValidationResponse;
}

@route("/api/bookings")
namespace Bookings {
  @get
  op listBookings(@query status?: BookingStatus): BookingsListResponse;

  @get
  @route("/{id}")
  op getBooking(id: string): BookingWithEvent | NotFoundErrorResponse;
}

model OkResponse {
  @statusCode statusCode: 200;
  message: string;
}

model ConflictErrorResponse {
  @statusCode statusCode: 409;
  message: string;
  error?: string;
}

model UnauthorizedErrorResponse {
  @statusCode statusCode: 401;
  message: string;
}

model NotFoundErrorResponse {
  @statusCode statusCode: 404;
  message: string;
}

model BadRequestErrorResponse {
  @statusCode statusCode: 400;
  message: string;
}

model ValidationResponse {
  @statusCode statusCode: 400;
  message: string;
  errors: FieldError[];
}
