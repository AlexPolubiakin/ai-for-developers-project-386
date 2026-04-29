export interface OwnerPublic {
  id: string;
  name: string;
  timezone: string;
}

export interface EventType {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventTypePublic {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
}

export type SlotStatus = "free" | "booked";

export interface Slot {
  startTime: string;
  endTime: string;
  status: SlotStatus;
}

export interface SlotDay {
  date: string;
  freeCount: number;
  slots: Slot[];
}

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  eventTypeId: string;
  eventTypeTitle: string;
  ownerId: string;
  startTime: string;
  endTime: string;
  guestName: string;
  guestEmail: string;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateEventTypeRequest {
  title: string;
  description?: string;
  durationMinutes: number;
}

export interface CreateBookingRequest {
  eventTypeId: string;
  startTime: string;
  guestName: string;
  guestEmail: string;
}

export interface OwnerEventTypesResponse {
  eventTypes: EventType[];
}

export interface CreatedEventTypeResponse {
  statusCode: 201;
  eventType: EventType;
}

export interface PublicEventTypesResponse {
  owner: OwnerPublic;
  eventTypes: EventTypePublic[];
}

export interface PublicEventTypeResponse {
  eventType: EventTypePublic;
}

export interface SlotsResponse {
  days: SlotDay[];
}

export interface CreatedBookingResponse {
  statusCode: 201;
  booking: Booking;
}

export interface BookingsListResponse {
  bookings: Booking[];
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
