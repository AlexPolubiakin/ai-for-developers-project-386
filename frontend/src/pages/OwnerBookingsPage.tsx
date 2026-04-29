import { useEffect, useState } from "react";
import { Badge, Button, Card, Container, Group, Stack, Text, Title } from "@mantine/core";
import { ownerApi } from "../api";
import { PageState } from "../components/shared/PageState";
import type { Booking } from "../types";
import { formatDateTime } from "../utils/date";
import { getErrorMessage } from "../utils/errors";
import type { Navigate } from "../utils/navigation";

export function OwnerBookingsPage({ navigate }: { navigate: Navigate }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await ownerApi.listUpcomingBookings();
        setBookings(response.data.bookings);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    void loadBookings();
  }, []);

  return (
    <main className="page">
      <Container size="lg">
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <Title order={1}>Предстоящие события</Title>
            <Button variant="default" onClick={() => navigate("/owner/event-types")}>
              Типы событий
            </Button>
          </Group>

          <PageState
            loading={loading}
            error={error}
            empty={!loading && bookings.length === 0 ? "Предстоящих событий пока нет." : ""}
          >
            <Stack>
              {bookings.map((booking) => (
                <Card key={booking.id} withBorder shadow="sm" padding="lg" radius="md">
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text fw={700}>{booking.guestName}</Text>
                      <Badge variant="light">{booking.eventTypeTitle}</Badge>
                    </Group>
                    <Text c="dimmed" size="sm">
                      {booking.guestEmail}
                    </Text>
                    <Text size="sm">Слот: {formatDateTime(booking.startTime)}</Text>
                    <Text c="dimmed" size="xs">
                      Создано: {formatDateTime(booking.createdAt)}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </PageState>
        </Stack>
      </Container>
    </main>
  );
}
