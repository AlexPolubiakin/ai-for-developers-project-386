import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/ru";
import type { Slot } from "../types";

export const DATE_FORMAT = "YYYY-MM-DD";

dayjs.locale("ru");

export function getDateRange() {
  const dateFrom = dayjs().startOf("day");

  return {
    dateFrom: dateFrom.format(DATE_FORMAT),
    dateTo: dateFrom.add(14, "day").format(DATE_FORMAT),
  };
}

export function formatDateLong(date?: string) {
  if (!date) {
    return "Дата не выбрана";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T00:00:00`));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatSlotRange(slot?: Pick<Slot, "startTime" | "endTime">) {
  if (!slot) {
    return "Время не выбрано";
  }

  return `${dayjs(slot.startTime).format("HH:mm")} - ${dayjs(slot.endTime).format(
    "HH:mm",
  )}`;
}

export function buildCalendarCells(month: Dayjs) {
  const firstDay = month.startOf("month");
  const mondayOffset = (firstDay.day() + 6) % 7;
  const firstCell = firstDay.subtract(mondayOffset, "day");

  return Array.from({ length: 42 }, (_, index) => firstCell.add(index, "day"));
}
