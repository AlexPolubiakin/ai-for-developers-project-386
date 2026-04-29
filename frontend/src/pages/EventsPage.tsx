import { useEffect, useState } from "react";
import { Badge, Button, Card, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { publicApi } from "../api";
import { PageState } from "../components/shared/PageState";
import type { EventTypePublic, OwnerPublic } from "../types";
import { getErrorMessage } from "../utils/errors";
import type { Navigate } from "../utils/navigation";

export function EventsPage({ navigate }: { navigate: Navigate }) {
  const [owner, setOwner] = useState<OwnerPublic | null>(null);
  const [eventTypes, setEventTypes] = useState<EventTypePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEventTypes = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await publicApi.listEventTypes();
        setOwner(response.data.owner);
        setEventTypes(response.data.eventTypes);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    void loadEventTypes();
  }, []);

  return (
    <main className="page">
      <Container size="lg">
        <Stack gap="xl">
          <Stack gap={4}>
            <Title order={1}>Выберите тип события</Title>
            <Text c="dimmed">
              {owner ? `${owner.name}, ${owner.timezone}` : "Публичные варианты записи"}
            </Text>
          </Stack>

          <PageState
            loading={loading}
            error={error}
            empty={!loading && eventTypes.length === 0 ? "Пока нет доступных типов событий." : ""}
          >
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
              {eventTypes.map((eventType) => (
                <Card key={eventType.id} withBorder shadow="sm" padding="lg" radius="md">
                  <Stack h="100%">
                    <Group justify="space-between" align="flex-start">
                      <Title order={3}>{eventType.title}</Title>
                      <Badge color="orange" variant="light">
                        {eventType.durationMinutes} мин
                      </Badge>
                    </Group>
                    <Text c="dimmed" className="card-description">
                      {eventType.description || "Короткая встреча с владельцем календаря."}
                    </Text>
                    <Button mt="auto" onClick={() => navigate(`/events/${eventType.id}`)}>
                      Выбрать время
                    </Button>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </PageState>
        </Stack>
      </Container>
    </main>
  );
}
