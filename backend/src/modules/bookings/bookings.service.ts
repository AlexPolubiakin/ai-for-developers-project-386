import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '../../generated/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { SlotsService } from '../slots/slots.service';

type BookingRecord = {
  id: string;
  eventTypeId: string;
  ownerId: string;
  startTime: Date;
  endTime: Date;
  guestName: string;
  guestEmail: string;
  status: 'confirmed' | 'cancelled';
  createdAt: Date;
  eventType: {
    title: string;
  };
};

@Injectable()
export class BookingsService {
  constructor(
    @Inject('PRISMA_CLIENT')
    private readonly prisma: PrismaClient,
    private readonly slotsService: SlotsService,
  ) {}

  async listUpcomingBookings() {
    const owner = await this.prisma.owner.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        ownerId: owner.id,
        status: 'confirmed',
        startTime: { gte: new Date() },
      },
      include: { eventType: { select: { title: true } } },
      orderBy: { startTime: 'asc' },
    });

    return { bookings: bookings.map((booking) => this.toBooking(booking)) };
  }

  async createBooking(body: CreateBookingDto) {
    const startTime = new Date(body.startTime);
    if (Number.isNaN(startTime.getTime())) {
      throw new BadRequestException('Invalid startTime');
    }

    const slot = await this.slotsService.findSlotForBooking(
      body.eventTypeId,
      startTime,
    );
    if (slot.status === 'booked') {
      throw new ConflictException('Slot is already booked');
    }

    const eventType = await this.prisma.eventType.findUnique({
      where: { id: body.eventTypeId },
      select: { ownerId: true, title: true },
    });

    if (!eventType) {
      throw new NotFoundException('Event type not found');
    }

    try {
      const booking = await this.prisma.booking.create({
        data: {
          eventTypeId: body.eventTypeId,
          ownerId: eventType.ownerId,
          startTime,
          endTime: new Date(slot.endTime),
          guestName: body.guestName.trim(),
          guestEmail: body.guestEmail.trim(),
          status: 'confirmed',
        },
        include: { eventType: { select: { title: true } } },
      });

      return { statusCode: 201, booking: this.toBooking(booking) };
    } catch (error) {
      if (this.isUniqueConflict(error)) {
        throw new ConflictException('Slot is already booked');
      }

      throw error;
    }
  }

  private isUniqueConflict(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }

  private toBooking(booking: BookingRecord) {
    return {
      id: booking.id,
      eventTypeId: booking.eventTypeId,
      eventTypeTitle: booking.eventType.title,
      ownerId: booking.ownerId,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
    };
  }
}
