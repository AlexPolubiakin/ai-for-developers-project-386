import { Button, Container, Paper, Stack, Title } from "@mantine/core";
import type { Navigate } from "../utils/navigation";

export function NotFoundPage({ navigate }: { navigate: Navigate }) {
  return (
    <main className="page">
      <Container size="lg">
        <Paper withBorder p="xl">
          <Stack align="center">
            <Title order={1}>Страница не найдена</Title>
            <Button onClick={() => navigate("/")}>На главную</Button>
          </Stack>
        </Paper>
      </Container>
    </main>
  );
}
