import { Button, Container, Group, Paper, Text, UnstyledButton } from "@mantine/core";
import type { Navigate } from "../../utils/navigation";

export function Header({ path, navigate }: { path: string; navigate: Navigate }) {
  return (
    <Paper component="header" radius={0} className="app-header">
      <Container size="lg">
        <Group justify="space-between" h={52}>
          <UnstyledButton className="brand" onClick={() => navigate("/")}>
            <span className="brand-mark" aria-hidden="true" />
            <Text fw={700}>Calendar</Text>
          </UnstyledButton>

          <Group gap="xs">
            <Button
              variant={path.startsWith("/events") ? "light" : "subtle"}
              size="xs"
              onClick={() => navigate("/events")}
            >
              Записаться
            </Button>
            <Button
              variant={path === "/owner/bookings" ? "light" : "subtle"}
              size="xs"
              onClick={() => navigate("/owner/bookings")}
            >
              Предстоящие события
            </Button>
          </Group>
        </Group>
      </Container>
    </Paper>
  );
}
