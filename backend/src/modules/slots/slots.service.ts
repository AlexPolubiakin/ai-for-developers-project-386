import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '../../generated/client';
import { GetSlotsQueryDto } from '../bookings/dto/get-slots-query.dto';

const SLOT_STEP_MINUTES = 30;
const BOOKING_WINDOW_DAYS = 14;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type OwnerRecord = {
  id: string;
  timezone: string;
};

type EventTypeRecord = {
  id: string;
  ownerId: string;
  durationMinutes: number;
};

export type SlotStatus = 'free' | 'booked';

export type GeneratedSlot = {
  startTime: string;
  endTime: string;
  status: SlotStatus;
};

@Injectable()
export class SlotsService {
  constructor(
    @Inject('PRISMA_CLIENT')
    private readonly prisma: PrismaClient,
  ) {}

  async getSlots(eventTypeId: string, query: GetSlotsQueryDto) {
    const { eventType, owner } = await this.getEventTypeWithOwner(eventTypeId);
    const dateRange = this.normalizeDateRange(
      query.dateFrom,
      query.dateTo,
      owner.timezone,
    );
    const bookings = await this.prisma.booking.findMany({
      where: {
        ownerId: owner.id,
        status: 'confirmed',
        startTime: {
          gte: this.zonedDateTimeToUtc(dateRange.from, '00:00', owner.timezone),
          lte: this.zonedDateTimeToUtc(dateRange.to, '23:59', owner.timezone),
        },
      },
      select: { startTime: true },
    });
    const bookedStartTimes = new Set(
      bookings.map((booking) => booking.startTime.toISOString()),
    );

    const days = [];
    for (const date of this.eachDate(dateRange.from, dateRange.to)) {
      const slots = await this.generateSlotsForDate(
        date,
        eventType,
        owner,
        bookedStartTimes,
      );
      days.push({
        date,
        freeCount: slots.filter((slot) => slot.status === 'free').length,
        slots,
      });
    }

    return { days };
  }

  async findSlotForBooking(
    eventTypeId: string,
    startTime: Date,
  ): Promise<GeneratedSlot> {
    const { owner } = await this.getEventTypeWithOwner(eventTypeId);
    const date = this.formatDateInTimeZone(startTime, owner.timezone);
    const { days } = await this.getSlots(eventTypeId, {
      dateFrom: date,
      dateTo: date,
    });
    const slot = days[0]?.slots.find(
      (candidate) => candidate.startTime === startTime.toISOString(),
    );

    if (!slot) {
      throw new BadRequestException('Slot is outside booking window');
    }

    return slot;
  }

  private async getEventTypeWithOwner(eventTypeId: string) {
    const owner = await this.getDefaultOwner();
    const eventType = await this.prisma.eventType.findFirst({
      where: { id: eventTypeId, ownerId: owner.id },
    });

    if (!eventType) {
      throw new NotFoundException('Event type not found');
    }

    return { eventType, owner };
  }

  private async getDefaultOwner(): Promise<OwnerRecord> {
    const owner = await this.prisma.owner.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    return owner;
  }

  private normalizeDateRange(
    dateFrom: string,
    dateTo: string,
    timezone: string,
  ) {
    if (!DATE_ONLY_PATTERN.test(dateFrom) || !DATE_ONLY_PATTERN.test(dateTo)) {
      throw new BadRequestException('Invalid date range');
    }

    const today = this.formatDateInTimeZone(new Date(), timezone);
    const maxDate = this.addDays(today, BOOKING_WINDOW_DAYS);

    if (
      this.compareDates(dateFrom, dateTo) > 0 ||
      this.compareDates(dateFrom, maxDate) > 0
    ) {
      throw new BadRequestException('Invalid date range');
    }

    return {
      from: this.compareDates(dateFrom, today) < 0 ? today : dateFrom,
      to: this.compareDates(dateTo, maxDate) > 0 ? maxDate : dateTo,
    };
  }

  private async generateSlotsForDate(
    date: string,
    eventType: EventTypeRecord,
    owner: OwnerRecord,
    bookedStartTimes: Set<string>,
  ): Promise<GeneratedSlot[]> {
    const scheduleIntervals = await this.prisma.scheduleInterval.findMany({
      where: {
        ownerId: owner.id,
        dayOfWeek: this.getDayOfWeek(date),
      },
      orderBy: { startTime: 'asc' },
    });
    const slots: GeneratedSlot[] = [];

    for (const interval of scheduleIntervals) {
      const intervalEnd = this.zonedDateTimeToUtc(
        date,
        interval.endTime,
        owner.timezone,
      );
      let start = this.zonedDateTimeToUtc(
        date,
        interval.startTime,
        owner.timezone,
      );

      while (true) {
        const end = this.addMinutes(start, eventType.durationMinutes);
        if (end.getTime() > intervalEnd.getTime()) {
          break;
        }

        const startTime = start.toISOString();
        slots.push({
          startTime,
          endTime: end.toISOString(),
          status: bookedStartTimes.has(startTime) ? 'booked' : 'free',
        });
        start = this.addMinutes(start, SLOT_STEP_MINUTES);
      }
    }

    return slots;
  }

  private eachDate(from: string, to: string) {
    const dates: string[] = [];
    let cursor = from;
    while (this.compareDates(cursor, to) <= 0) {
      dates.push(cursor);
      cursor = this.addDays(cursor, 1);
    }
    return dates;
  }

  private compareDates(left: string, right: string) {
    return left.localeCompare(right);
  }

  private addDays(date: string, days: number) {
    const next = new Date(`${date}T00:00:00.000Z`);
    next.setUTCDate(next.getUTCDate() + days);
    return next.toISOString().slice(0, 10);
  }

  private addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60_000);
  }

  private getDayOfWeek(date: string) {
    return new Date(`${date}T12:00:00.000Z`).getUTCDay();
  }

  private zonedDateTimeToUtc(date: string, time: string, timezone: string) {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const offsetMs = this.getTimezoneOffsetMs(utcGuess, timezone);
    return new Date(utcGuess.getTime() - offsetMs);
  }

  private getTimezoneOffsetMs(date: Date, timezone: string) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value]),
    );
    const localAsUtc = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second),
    );

    return localAsUtc - date.getTime();
  }

  private formatDateInTimeZone(date: Date, timezone: string) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value]),
    );

    return `${values.year}-${values.month}-${values.day}`;
  }
}
