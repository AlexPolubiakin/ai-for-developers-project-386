import { expect, test } from "@playwright/test";

test.describe("booking flow", () => {
  test("guest books an available Intro Call slot and owner sees the booking", async ({
    page,
  }) => {
    const guestName = "E2E Guest";
    const guestEmail = `e2e-${Date.now()}@example.com`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const firstFutureDate = tomorrow.toISOString().slice(0, 10);

    await page.goto("/events");
    await expect(page.getByRole("heading", { name: "Выберите тип события" })).toBeVisible();

    const introCall = page.getByTestId("event-type-intro-call");
    await expect(introCall).toBeVisible();
    await introCall.getByRole("button", { name: "Выбрать время" }).click();

    await expect(page.getByRole("heading", { name: "Запись на звонок" })).toBeVisible();

    const availableDays = page.locator(
      '[data-testid^="calendar-day-"]:not([data-free-count="0"])',
    );
    await expect(availableDays.first()).toBeVisible();
    const availableDayCount = await availableDays.count();
    let selectedFutureDay = false;

    for (let index = 0; index < availableDayCount; index += 1) {
      const day = availableDays.nth(index);
      const date = await day.getAttribute("data-date");
      if (date && date >= firstFutureDate) {
        await day.click();
        selectedFutureDay = true;
        break;
      }
    }

    expect(selectedFutureDay).toBe(true);

    const freeSlot = page.locator('[data-testid="slot-option"][data-status="free"]').first();
    await expect(freeSlot).toBeVisible();
    await freeSlot.click();

    await page.getByRole("button", { name: "Продолжить" }).click();
    await expect(page.getByRole("heading", { name: "Подтверждение записи" })).toBeVisible();

    await page.getByTestId("guest-name").fill(guestName);
    await page.getByTestId("guest-email").fill(guestEmail);
    await page.getByTestId("confirm-booking").click();

    await expect(page.getByRole("heading", { name: "Бронь подтверждена. До встречи!" })).toBeVisible();

    await page.goto("/owner/bookings");
    await expect(page.getByRole("heading", { name: "Предстоящие события" })).toBeVisible();
    await expect(page.getByText(guestName)).toBeVisible();
    await expect(page.getByText(guestEmail)).toBeVisible();
    await expect(page.getByText("Intro Call")).toBeVisible();
  });
});
