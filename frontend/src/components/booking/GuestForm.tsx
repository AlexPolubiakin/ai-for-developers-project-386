import { useState } from "react";
import { Button, Group, Paper, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { publicApi } from "../../api";
import type { Slot } from "../../types";
import { getErrorMessage } from "../../utils/errors";

export function GuestForm({
  eventTypeId,
  markSelectedSlotBooked,
  onBack,
  onSuccess,
  selectedSlot,
}: {
  eventTypeId: string;
  markSelectedSlotBooked: () => void;
  onBack: () => void;
  onSuccess: () => void;
  selectedSlot: Slot | null;
}) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm({
    initialValues: {
      guestName: "",
      guestEmail: "",
    },
    validate: {
      guestName: (value) => (value.trim().length === 0 ? "Введите имя" : null),
      guestEmail: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Введите корректный email"),
    },
  });

  const submit = async (values: typeof form.values) => {
    if (!selectedSlot) {
      return;
    }

    setSubmitting(true);

    try {
      await publicApi.createBooking({
        eventTypeId,
        startTime: selectedSlot.startTime,
        guestName: values.guestName,
        guestEmail: values.guestEmail,
      });
      markSelectedSlotBooked();
      notifications.show({
        color: "green",
        title: "Готово",
        message: "Бронь подтверждена.",
      });
      onSuccess();
    } catch (requestError) {
      notifications.show({
        color: "red",
        title: "Не удалось создать бронь",
        message: getErrorMessage(requestError),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper withBorder p="lg" radius="md" className="booking-panel">
      <form onSubmit={form.onSubmit(submit)}>
        <Stack>
          <Group justify="space-between">
            <Title order={3}>Подтверждение записи</Title>
            <Button variant="default" size="xs" onClick={onBack}>
              Изменить
            </Button>
          </Group>
          <TextInput
            data-testid="guest-name"
            placeholder="Имя"
            {...form.getInputProps("guestName")}
          />
          <TextInput
            data-testid="guest-email"
            placeholder="Email"
            {...form.getInputProps("guestEmail")}
          />
          <Button
            type="submit"
            loading={submitting}
            className="primary-cta"
            data-testid="confirm-booking"
          >
            Подтвердить запись
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
