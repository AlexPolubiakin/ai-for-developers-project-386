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
  listEventTypes: () => api.get<PublicEventTypesResponse>("/public/event-types"),

  getEventType: (eventTypeId: string) =>
    api.get<PublicEventTypeResponse>(`/public/event-types/${eventTypeId}`),

  getSlots: (
    eventTypeId: string,
    params: {
      dateFrom: string;
      dateTo: string;
    },
  ) =>
    api.get<SlotsResponse>(`/public/event-types/${eventTypeId}/slots`, {
      params,
    }),

  createBooking: (data: CreateBookingRequest) =>
    api.post<CreatedBookingResponse>("/public/bookings", data),
};

export const ownerApi = {
  listEventTypes: () => api.get<OwnerEventTypesResponse>("/owner/event-types"),

  createEventType: (data: CreateEventTypeRequest) =>
    api.post<CreatedEventTypeResponse>("/owner/event-types", data),

  listUpcomingBookings: () =>
    api.get<BookingsListResponse>("/owner/bookings/upcoming"),
};
