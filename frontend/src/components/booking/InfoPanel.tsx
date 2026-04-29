import { Paper, Stack, Text, Title } from "@mantine/core";
import type { EventTypePublic, Slot, SlotDay } from "../../types";
import { formatDateLong, formatSlotRange } from "../../utils/date";

export function InfoPanel({
  eventType,
  selectedDate,
  selectedDay,
  selectedSlot,
}: {
  eventType: EventTypePublic;
  selectedDate: string;
  selectedDay?: SlotDay;
  selectedSlot: Slot | null;
}) {
  return (
    <Paper withBorder p="lg" radius="md" className="booking-panel">
      <Stack gap="sm">
        <Title order={3}>Информация</Title>
        <InfoBox label="Выбранная дата" value={formatDateLong(selectedDate)} />
        <InfoBox label="Выбранное время" value={formatSlotRange(selectedSlot ?? undefined)} />
        <InfoBox label="Свободно" value={String(selectedDay?.freeCount ?? 0)} />
        <InfoBox
          label="Длительность в дне"
          value={selectedDay ? `${eventType.durationMinutes} мин` : "Нет слотов на этот день"}
        />
      </Stack>
    </Paper>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <Paper p="sm" radius="md" className="info-box">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={600} size="sm">
        {value}
      </Text>
    </Paper>
  );
}
