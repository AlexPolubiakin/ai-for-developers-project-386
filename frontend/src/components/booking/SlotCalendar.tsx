import { useMemo } from "react";
import { Button, Group, Paper, SimpleGrid, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import type { Dayjs } from "dayjs";
import type { SlotDay } from "../../types";
import { buildCalendarCells, DATE_FORMAT } from "../../utils/date";

export function SlotCalendar({
  days,
  onMonthChange,
  onSelectDate,
  selectedDate,
  visibleMonth,
}: {
  days: SlotDay[];
  onMonthChange: (month: Dayjs) => void;
  onSelectDate: (date: string) => void;
  selectedDate: string;
  visibleMonth: Dayjs;
}) {
  const daysByDate = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);
  const cells = useMemo(() => buildCalendarCells(visibleMonth), [visibleMonth]);

  return (
    <Paper withBorder p="lg" radius="md" className="booking-panel">
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Календарь</Title>
          <Group gap="xs">
            <Button
              variant="default"
              size="xs"
              onClick={() => onMonthChange(visibleMonth.subtract(1, "month"))}
            >
              -
            </Button>
            <Button
              variant="default"
              size="xs"
              onClick={() => onMonthChange(visibleMonth.add(1, "month"))}
            >
              +
            </Button>
          </Group>
        </Group>
        <Text size="sm" fw={600}>
          {visibleMonth.format("MMMM YYYY")}
        </Text>
        <SimpleGrid cols={7} spacing={6}>
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((dayName) => (
            <Text key={dayName} ta="center" size="xs" fw={600} c="dimmed">
              {dayName}
            </Text>
          ))}
          {cells.map((cell) => {
            const date = cell.format(DATE_FORMAT);
            const slotDay = daysByDate.get(date);
            const isSelected = selectedDate === date;
            const isOutside = cell.month() !== visibleMonth.month();

            return (
              <UnstyledButton
                key={date}
                className={[
                  "calendar-day",
                  isSelected ? "calendar-day-selected" : "",
                  isOutside ? "calendar-day-outside" : "",
                ].join(" ")}
                data-date={date}
                data-free-count={slotDay?.freeCount ?? 0}
                data-testid={`calendar-day-${date}`}
                onClick={() => onSelectDate(date)}
              >
                <Text size="sm">{cell.date()}</Text>
                {slotDay && (
                  <Text size="xs" c={slotDay.freeCount > 0 ? "orange" : "dimmed"}>
                    {slotDay.freeCount} св.
                  </Text>
                )}
              </UnstyledButton>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
