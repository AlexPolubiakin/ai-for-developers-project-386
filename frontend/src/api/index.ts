import api from "./client";
import type {
  BookingsListResponse,
  CreateBookingRequest,
  CreateEventTypeRequest,
  CreatedBookingResponse,
  CreatedEventTypeResponse,
  OwnerEventTypesResponse,
  PublicEventTypeResponse,
  PublicEventTypesResponse,
  SlotsResponse,
} from "../types";

export const publicApi = {
  listEventTypes: () => api.get<PublicEventTypesResponse>("/api/public/event-types"),

  getEventType: (eventTypeId: string) =>
    api.get<PublicEventTypeResponse>(`/api/public/event-types/${eventTypeId}`),

  getSlots: (
    eventTypeId: string,
    params: {
      dateFrom: string;
      dateTo: string;
    },
  ) =>
    api.get<SlotsResponse>(`/api/public/event-types/${eventTypeId}/slots`, {
      params,
    }),

  createBooking: (data: CreateBookingRequest) =>
    api.post<CreatedBookingResponse>("/api/public/bookings", data),
};

export const ownerApi = {
  listEventTypes: () => api.get<OwnerEventTypesResponse>("/api/owner/event-types"),

  createEventType: (data: CreateEventTypeRequest) =>
    api.post<CreatedEventTypeResponse>("/api/owner/event-types", data),

  listUpcomingBookings: () =>
    api.get<BookingsListResponse>("/api/owner/bookings/upcoming"),
};
