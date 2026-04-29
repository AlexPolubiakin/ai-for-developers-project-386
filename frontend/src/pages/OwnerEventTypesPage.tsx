import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { ownerApi } from "../api";
import { PageState } from "../components/shared/PageState";
import type { EventType } from "../types";
import { getErrorMessage } from "../utils/errors";

export function OwnerEventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      durationMinutes: 30,
    },
    validate: {
      title: (value) => (value.trim().length === 0 ? "Введите название" : null),
      durationMinutes: (value) => (value <= 0 ? "Длительность должна быть больше 0" : null),
    },
  });

  const loadEventTypes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await ownerApi.listEventTypes();
      setEventTypes(response.data.eventTypes);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEventTypes();
  }, [loadEventTypes]);

  const submit = async (values: typeof form.values) => {
    setSaving(true);

    try {
      await ownerApi.createEventType({
        title: values.title,
        description: values.description.trim() || undefined,
        durationMinutes: values.durationMinutes,
      });
      form.reset();
      notifications.show({
        color: "green",
        title: "Тип события создан",
        message: "Список обновлен.",
      });
      await loadEventTypes();
    } catch (requestError) {
      notifications.show({
        color: "red",
        title: "Не удалось создать тип события",
        message: getErrorMessage(requestError),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page">
      <Container size="lg">
        <Stack gap="xl">
          <Title order={1}>Типы событий</Title>
          <Grid gap="lg">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper withBorder p="lg" radius="md">
                <form onSubmit={form.onSubmit(submit)}>
                  <Stack>
                    <Title order={3}>Создать тип события</Title>
                    <TextInput label="Название" placeholder="Intro Call" {...form.getInputProps("title")} />
                    <Textarea
                      label="Описание"
                      placeholder="30-minute intro call"
                      {...form.getInputProps("description")}
                    />
                    <NumberInput
                      label="Длительность, мин"
                      min={1}
                      {...form.getInputProps("durationMinutes")}
                    />
                    <Button type="submit" loading={saving} className="primary-cta">
                      Создать
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <PageState
                loading={loading}
                error={error}
                empty={!loading && eventTypes.length === 0 ? "Типы событий пока не созданы." : ""}
              >
                <Stack>
                  {eventTypes.map((eventType) => (
                    <Card key={eventType.id} withBorder shadow="sm" padding="lg">
                      <Group justify="space-between" align="flex-start">
                        <Stack gap={4}>
                          <Text fw={700}>{eventType.title}</Text>
                          <Text c="dimmed" size="sm">
                            {eventType.description || "Без описания"}
                          </Text>
                        </Stack>
                        <Badge color="orange" variant="light">
                          {eventType.durationMinutes} мин
                        </Badge>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </PageState>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </main>
  );
}
