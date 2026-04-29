import { Badge, Button, Group, Paper, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import type { Slot, SlotDay } from "../../types";
import type { Navigate } from "../../utils/navigation";
import { formatSlotRange } from "../../utils/date";

export function SlotList({
  navigate,
  onContinue,
  onSelectSlot,
  selectedDate,
  selectedDay,
  selectedSlot,
}: {
  navigate: Navigate;
  onContinue: () => void;
  onSelectSlot: (slot: Slot) => void;
  selectedDate: string;
  selectedDay?: SlotDay;
  selectedSlot: Slot | null;
}) {
  return (
    <Paper withBorder p="lg" radius="md" className="booking-panel">
      <Stack h="100%">
        <Title order={3}>Статус слотов</Title>

        <Stack className="slot-list" gap="xs">
          {!selectedDate && (
            <Paper p="sm" className="info-box">
              <Text c="dimmed" size="sm">
                Выберите дату в календаре.
              </Text>
            </Paper>
          )}

          {selectedDate && (!selectedDay || selectedDay.slots.length === 0) && (
            <Paper p="sm" className="info-box">
              <Text c="dimmed" size="sm">
                На выбранный день нет слотов.
              </Text>
            </Paper>
          )}

          {selectedDay?.slots.map((slot) => {
            const isFree = slot.status === "free";
            const isSelected = selectedSlot?.startTime === slot.startTime;

            return (
              <UnstyledButton
                key={slot.startTime}
                className={[
                  "slot-row",
                  isSelected ? "slot-row-selected" : "",
                  !isFree ? "slot-row-disabled" : "",
                ].join(" ")}
                data-status={slot.status}
                data-testid="slot-option"
                disabled={!isFree}
                onClick={() => onSelectSlot(slot)}
              >
                <Text size="sm">{formatSlotRange(slot)}</Text>
                <Badge color={isFree ? "green" : "gray"} variant="light">
                  {isFree ? "Свободно" : "Занято"}
                </Badge>
              </UnstyledButton>
            );
          })}
        </Stack>

        <Group grow mt="auto">
          <Button variant="default" onClick={() => navigate("/events")}>
            Назад
          </Button>
          <Button className="primary-cta" disabled={!selectedSlot} onClick={onContinue}>
            Продолжить
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
