import { Button, Paper, Stack, Title } from "@mantine/core";

export function BookingConfirmed({ onBookAgain }: { onBookAgain: () => void }) {
  return (
    <Paper withBorder p="xl" radius="md" className="booking-panel">
      <Stack align="center" gap="lg">
        <Title order={2} ta="center">
          Бронь подтверждена. До встречи!
        </Title>
        <Button fullWidth className="primary-cta" onClick={onBookAgain}>
          Забронировать еще
        </Button>
      </Stack>
    </Paper>
  );
}
