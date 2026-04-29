import { Badge, Button, Container, Grid, Paper, Stack, Text, Title } from "@mantine/core";
import type { Navigate } from "../utils/navigation";

export function LandingPage({ navigate }: { navigate: Navigate }) {
  return (
    <main className="landing-page">
      <Container size="lg" py={52}>
        <Grid align="flex-start" gap={72}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack align="flex-start" gap="lg">
              <Badge variant="white" color="gray">
                БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК
              </Badge>
              <Title order={1} className="hero-title">
                Calendar
              </Title>
              <Text size="lg" c="dimmed" maw={520}>
                Один экран, понятные слоты, быстрая бронь. Выберите время и
                запишитесь на звонок без лишних шагов.
              </Text>
              <Button size="md" className="primary-cta" onClick={() => navigate("/events")}>
                Записаться -&gt;
              </Button>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="xl" radius="md" shadow="sm" className="feature-card">
              <Stack gap="md">
                <Title order={3}>Что доступно прямо сейчас</Title>
                <Text c="dimmed">* Фиксированные 30-минутные слоты с 09:00 до 18:00.</Text>
                <Text c="dimmed">* Проверка конфликта при бронировании.</Text>
                <Text c="dimmed">* Просмотр предстоящих событий в отдельном разделе.</Text>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </main>
  );
}
