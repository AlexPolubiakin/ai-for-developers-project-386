import type { ReactNode } from "react";
import { Alert, Loader, Paper, Stack, Text } from "@mantine/core";

export function PageState({
  error,
  loading,
  empty,
  children,
}: {
  error?: string;
  loading?: boolean;
  empty?: string;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <Stack align="center" py="xl">
        <Loader />
        <Text c="dimmed">Загружаем данные...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Ошибка">
        {error}
      </Alert>
    );
  }

  if (empty) {
    return (
      <Paper p="xl" withBorder>
        <Text c="dimmed" ta="center">
          {empty}
        </Text>
      </Paper>
    );
  }

  return children;
}
