export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  timezone: string;
}

export interface EventType {
  id: string;
  userId: string;
  name: string;
  description?: string;
  slug: string;
  durationMinutes: number;
  slotInterval: number;
}

export interface EventTypePublic {
  name: string;
  slug: string;
  description?: string;
  durationMinutes: number;
}

export interface ScheduleInterval {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Slot {
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  userId: string;
  startTime: string;
  endTime: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  cancelToken: string;
  status: "confirmed" | "cancelled";
  cancelledAt?: string;
  createdAt: string;
}

export interface BookingPublic {
  id: string;
  startTime: string;
  endTime: string;
  cancelToken: string;
}

export interface BookingWithEvent {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  startTime: string;
  endTime: string;
  eventTypeName: string;
  eventTypeSlug: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
}

export interface BookingDetails {
  startTime: string;
  endTime: string;
  eventTypeName: string;
  ownerName: string;
  status: "confirmed" | "cancelled";
}

export interface PublicEventsResponse {
  owner: {
    name: string;
    username: string;
  };
  events: EventTypePublic[];
}

export interface AuthResponse {
  user: User;
}

export interface SlotsResponse {
  slots: Slot[];
}

export interface BookingsListResponse {
  bookings: BookingWithEvent[];
}
