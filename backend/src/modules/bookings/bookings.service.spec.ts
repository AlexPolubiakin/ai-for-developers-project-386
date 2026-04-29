import { BadRequestException, ConflictException } from '@nestjs/common';
import type { PrismaClient } from '../../generated/client';
import { SlotsService } from '../slots/slots.service';
import { BookingsService } from './bookings.service';

type FindManyArgs = {
  where: {
    ownerId: string;
    status: string;
    startTime: { gte: Date };
  };
  orderBy: { startTime: string };
};

describe('BookingsService', () => {
  const createService = () => {
    const prisma = {
      owner: {
        findFirst: jest.fn(),
      },
      eventType: {
        findUnique: jest.fn(),
      },
      booking: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };
    const slotsService = {
      findSlotForBooking: jest.fn(),
    };
    const service = new BookingsService(
      prisma as unknown as PrismaClient,
      slotsService as unknown as SlotsService,
    );

    return { service, prisma, slotsService };
  };

  it('rejects booking when selected slot is already booked', async () => {
    const { service, slotsService } = createService();
    slotsService.findSlotForBooking.mockResolvedValue({
      startTime: '2026-05-01T06:00:00.000Z',
      endTime: '2026-05-01T06:30:00.000Z',
      status: 'booked',
    });

    await expect(
      service.createBooking({
        eventTypeId: 'event-type-id',
        startTime: '2026-05-01T06:00:00.000Z',
        guestName: 'Demo User',
        guestEmail: 'demo@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects booking when selected slot is outside the generated window', async () => {
    const { service, slotsService } = createService();
    slotsService.findSlotForBooking.mockRejectedValue(
      new BadRequestException('Slot is outside booking window'),
    );

    await expect(
      service.createBooking({
        eventTypeId: 'event-type-id',
        startTime: '2026-05-30T06:00:00.000Z',
        guestName: 'Demo User',
        guestEmail: 'demo@example.com',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('maps unique owner start-time violations to a booking conflict', async () => {
    const { service, prisma, slotsService } = createService();
    slotsService.findSlotForBooking.mockResolvedValue({
      startTime: '2026-05-01T06:00:00.000Z',
      endTime: '2026-05-01T06:30:00.000Z',
      status: 'free',
    });
    prisma.eventType.findUnique.mockResolvedValue({
      ownerId: 'owner-id',
      title: 'Intro Call',
    });
    prisma.booking.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.createBooking({
        eventTypeId: 'event-type-id',
        startTime: '2026-05-01T06:00:00.000Z',
        guestName: 'Demo User',
        guestEmail: 'demo@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('requests only future confirmed bookings for the default owner', async () => {
    const { service, prisma } = createService();
    prisma.owner.findFirst.mockResolvedValue({ id: 'owner-id' });
    prisma.booking.findMany.mockResolvedValue([]);

    await service.listUpcomingBookings();

    const [findManyArgs] = prisma.booking.findMany.mock.calls[0] as [
      FindManyArgs,
    ];
    expect(findManyArgs.where.ownerId).toBe('owner-id');
    expect(findManyArgs.where.status).toBe('confirmed');
    expect(findManyArgs.where.startTime.gte).toBeInstanceOf(Date);
    expect(findManyArgs.orderBy).toEqual({ startTime: 'asc' });
  });
});
