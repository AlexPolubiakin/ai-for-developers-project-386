using TypeSpec.Http;

@route("/api/owner")
namespace OwnerApi {
  @get
  @route("/event-types")
  op listEventTypes(): OwnerEventTypesResponse;

  @post
  @route("/event-types")
  op createEventType(
    body: CreateEventTypeRequest
  ): CreatedEventTypeResponse | ValidationResponse;

  @get
  @route("/bookings/upcoming")
  op listUpcomingBookings(): BookingsListResponse;
}

@route("/api/public")
namespace PublicApi {
  @get
  @route("/event-types")
  op listPublicEventTypes(): PublicEventTypesResponse;

  @get
  @route("/event-types/{eventTypeId}")
  op getPublicEventType(
    @path eventTypeId: string
  ): PublicEventTypeResponse | NotFoundErrorResponse;

  @get
  @route("/event-types/{eventTypeId}/slots")
  op getSlots(
    @path eventTypeId: string,
    @query dateFrom: string,
    @query dateTo: string
  ): SlotsResponse | NotFoundErrorResponse | ValidationResponse;

  @post
  @route("/bookings")
  op createBooking(
    body: CreateBookingRequest
  ): CreatedBookingResponse | ConflictErrorResponse | NotFoundErrorResponse | ValidationResponse;
}
