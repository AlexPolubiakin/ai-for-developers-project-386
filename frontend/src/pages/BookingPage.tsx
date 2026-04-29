import { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Grid, Stack, Title } from "@mantine/core";
import dayjs, { type Dayjs } from "dayjs";
import { publicApi } from "../api";
import { BookingConfirmed } from "../components/booking/BookingConfirmed";
import { GuestForm } from "../components/booking/GuestForm";
import { InfoPanel } from "../components/booking/InfoPanel";
import { SlotCalendar } from "../components/booking/SlotCalendar";
import { SlotList } from "../components/booking/SlotList";
import { PageState } from "../components/shared/PageState";
import type { EventTypePublic, Slot, SlotDay } from "../types";
import { getDateRange } from "../utils/date";
import { getErrorMessage } from "../utils/errors";
import type { Navigate } from "../utils/navigation";

type BookingStep = "select-slot" | "guest-form" | "confirmed";

interface BookingData {
  eventType: EventTypePublic;
  days: SlotDay[];
}

async function fetchBookingData(eventTypeId: string): Promise<BookingData> {
  const { dateFrom, dateTo } = getDateRange();
  const [eventResponse, slotsResponse] = await Promise.all([
    publicApi.getEventType(eventTypeId),
    publicApi.getSlots(eventTypeId, { dateFrom, dateTo }),
  ]);

  return {
    eventType: eventResponse.data.eventType,
    days: slotsResponse.data.days,
  };
}

export function BookingPage({
  eventTypeId,
  navigate,
}: {
  eventTypeId: string;
  navigate: Navigate;
}) {
  const [eventType, setEventType] = useState<EventTypePublic | null>(null);
  const [days, setDays] = useState<SlotDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState<BookingStep>("select-slot");
  const [visibleMonth, setVisibleMonth] = useState(dayjs().startOf("month"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBooking = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchBookingData(eventTypeId);
      setEventType(data.eventType);
      setDays(data.days);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [eventTypeId]);

  useEffect(() => {
    void loadBooking();
  }, [loadBooking]);

  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate),
    [days, selectedDate],
  );

  const resetFlow = () => {
    setSelectedDate("");
    setSelectedSlot(null);
    setStep("select-slot");
    void loadBooking();
  };

  const markSelectedSlotBooked = () => {
    if (!selectedSlot || !selectedDate) {
      return;
    }

    setDays((currentDays) =>
      currentDays.map((day) => {
        if (day.date !== selectedDate) {
          return day;
        }

        return {
          ...day,
          freeCount: Math.max(day.freeCount - 1, 0),
          slots: day.slots.map((slot) =>
            slot.startTime === selectedSlot.startTime ? { ...slot, status: "booked" } : slot,
          ),
        };
      }),
    );
  };

  return (
    <main className="page">
      <Container size="lg">
        <Stack gap="xl">
          <Title order={1}>Запись на звонок</Title>

          <PageState loading={loading} error={error}>
            {eventType && (
              <BookingContent
                days={days}
                eventType={eventType}
                markSelectedSlotBooked={markSelectedSlotBooked}
                navigate={navigate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }}
                onSelectSlot={setSelectedSlot}
                selectedDate={selectedDate}
                selectedDay={selectedDay}
                selectedSlot={selectedSlot}
                setStep={setStep}
                step={step}
                visibleMonth={visibleMonth}
                onMonthChange={setVisibleMonth}
                onBookAgain={resetFlow}
              />
            )}
          </PageState>
        </Stack>
      </Container>
    </main>
  );
}

function BookingContent({
  days,
  eventType,
  markSelectedSlotBooked,
  navigate,
  onBookAgain,
  onMonthChange,
  onSelectDate,
  onSelectSlot,
  selectedDate,
  selectedDay,
  selectedSlot,
  setStep,
  step,
  visibleMonth,
}: {
  days: SlotDay[];
  eventType: EventTypePublic;
  markSelectedSlotBooked: () => void;
  navigate: Navigate;
  onBookAgain: () => void;
  onMonthChange: (month: Dayjs) => void;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: Slot) => void;
  selectedDate: string;
  selectedDay?: SlotDay;
  selectedSlot: Slot | null;
  setStep: (step: BookingStep) => void;
  step: BookingStep;
  visibleMonth: Dayjs;
}) {
  if (step === "guest-form") {
    return (
      <Grid gap="lg">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <InfoPanel
            eventType={eventType}
            selectedDate={selectedDate}
            selectedDay={selectedDay}
            selectedSlot={selectedSlot}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <GuestForm
            eventTypeId={eventType.id}
            markSelectedSlotBooked={markSelectedSlotBooked}
            selectedSlot={selectedSlot}
            onBack={() => setStep("select-slot")}
            onSuccess={() => setStep("confirmed")}
          />
        </Grid.Col>
      </Grid>
    );
  }

  if (step === "confirmed") {
    return (
      <Grid gap="lg">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <InfoPanel
            eventType={eventType}
            selectedDate={selectedDate}
            selectedDay={selectedDay}
            selectedSlot={selectedSlot}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <BookingConfirmed onBookAgain={onBookAgain} />
        </Grid.Col>
      </Grid>
    );
  }

  return (
    <Grid gap="lg">
      <Grid.Col span={{ base: 12, md: 3 }}>
        <InfoPanel
          eventType={eventType}
          selectedDate={selectedDate}
          selectedDay={selectedDay}
          selectedSlot={selectedSlot}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 5 }}>
        <SlotCalendar
          days={days}
          selectedDate={selectedDate}
          visibleMonth={visibleMonth}
          onMonthChange={onMonthChange}
          onSelectDate={onSelectDate}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <SlotList
          navigate={navigate}
          selectedDate={selectedDate}
          selectedDay={selectedDay}
          selectedSlot={selectedSlot}
          onContinue={() => setStep("guest-form")}
          onSelectSlot={onSelectSlot}
        />
      </Grid.Col>
    </Grid>
  );
}
