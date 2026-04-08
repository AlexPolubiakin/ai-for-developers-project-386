import api from "./client";
import type {
  AuthResponse,
  PublicEventsResponse,
  EventTypePublic,
  SlotsResponse,
  BookingPublic,
  BookingDetails,
  EventType,
  ScheduleInterval,
  BookingsListResponse,
} from "../types";

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    name: string;
    username: string;
  }) => api.post<AuthResponse>("/api/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/login", data),

  logout: () => api.post("/api/auth/logout"),

  me: () => api.get<AuthResponse>("/api/auth/me"),

  forgotPassword: (data: { email: string }) =>
    api.post("/api/auth/forgot-password", data),

  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post("/api/auth/reset-password", data),

  checkUsername: (username: string) =>
    api.get<{ available: boolean }>(`/api/auth/check-username`, {
      params: { username },
    }),
};

export const publicApi = {
  getEvents: (username: string) =>
    api.get<PublicEventsResponse>(`/api/public/users/${username}/events`),

  getEvent: (username: string, slug: string) =>
    api.get<EventTypePublic>(`/api/public/users/${username}/events/${slug}`),

  getSlots: (params: {
    username: string;
    eventSlug: string;
    dateFrom: string;
    dateTo: string;
  }) => api.get<SlotsResponse>("/api/public/slots", { params }),

  createBooking: (data: {
    username: string;
    eventSlug: string;
    startTime: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
  }) => api.post<BookingPublic>("/api/public/bookings", data),

  getBookingByCancelToken: (cancelToken: string) =>
    api.get<BookingDetails>(`/api/public/bookings/${cancelToken}`),

  cancelBooking: (cancelToken: string) =>
    api.post<BookingPublic>(`/api/public/bookings/${cancelToken}/cancel`),
};

export const eventsApi = {
  list: () => api.get<EventType[]>("/api/events"),

  create: (data: {
    name: string;
    description?: string;
    slug: string;
    durationMinutes: number;
    slotInterval: number;
  }) => api.post<EventType>("/api/events", data),

  get: (id: string) => api.get<EventType>(`/api/events/${id}`),

  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      durationMinutes?: number;
      slotInterval?: number;
    }
  ) => api.put<EventType>(`/api/events/${id}`, data),

  delete: (id: string) => api.delete(`/api/events/${id}`),
};

export const scheduleApi = {
  get: () => api.get<ScheduleInterval[]>("/api/schedule"),

  update: (data: { intervals: ScheduleInterval[] }) =>
    api.put<ScheduleInterval[]>("/api/schedule", data),
};

export const bookingsApi = {
  list: (status?: "confirmed" | "cancelled") =>
    api.get<BookingsListResponse>("/api/bookings", {
      params: status ? { status } : undefined,
    }),

  get: (id: string) => api.get(`/api/bookings/${id}`),
};
