import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '../../generated/client';
import { CreateEventTypeDto } from './dto/create-event-type.dto';

type OwnerRecord = {
  id: string;
  name: string;
  timezone: string;
};

type EventTypeRecord = {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class EventsService {
  constructor(
    @Inject('PRISMA_CLIENT')
    private readonly prisma: PrismaClient,
  ) {}

  async listOwnerEventTypes() {
    const owner = await this.getDefaultOwner();
    const eventTypes = await this.prisma.eventType.findMany({
      where: { ownerId: owner.id },
      orderBy: { createdAt: 'asc' },
    });

    return {
      eventTypes: eventTypes.map((eventType) => this.toEventType(eventType)),
    };
  }

  async createOwnerEventType(body: CreateEventTypeDto) {
    const owner = await this.getDefaultOwner();
    const eventType = await this.prisma.eventType.create({
      data: {
        ownerId: owner.id,
        title: body.title.trim(),
        description: body.description?.trim() || undefined,
        durationMinutes: body.durationMinutes,
      },
    });

    return { statusCode: 201, eventType: this.toEventType(eventType) };
  }

  async listPublicEventTypes() {
    const owner = await this.getDefaultOwner();
    const eventTypes = await this.prisma.eventType.findMany({
      where: { ownerId: owner.id },
      orderBy: { createdAt: 'asc' },
    });

    return {
      owner: this.toPublicOwner(owner),
      eventTypes: eventTypes.map((eventType) =>
        this.toPublicEventType(eventType),
      ),
    };
  }

  async getPublicEventType(eventTypeId: string) {
    const owner = await this.getDefaultOwner();
    const eventType = await this.prisma.eventType.findFirst({
      where: { id: eventTypeId, ownerId: owner.id },
    });

    if (!eventType) {
      throw new NotFoundException('Event type not found');
    }

    return { eventType: this.toPublicEventType(eventType) };
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

  private toPublicOwner(owner: OwnerRecord) {
    return {
      id: owner.id,
      name: owner.name,
      timezone: owner.timezone,
    };
  }

  private toEventType(eventType: EventTypeRecord) {
    return {
      id: eventType.id,
      ownerId: eventType.ownerId,
      title: eventType.title,
      description: eventType.description ?? undefined,
      durationMinutes: eventType.durationMinutes,
      createdAt: eventType.createdAt.toISOString(),
      updatedAt: eventType.updatedAt.toISOString(),
    };
  }

  private toPublicEventType(eventType: EventTypeRecord) {
    return {
      id: eventType.id,
      title: eventType.title,
      description: eventType.description ?? undefined,
      durationMinutes: eventType.durationMinutes,
    };
  }
}
