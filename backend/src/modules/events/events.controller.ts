import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { EventsService } from './events.service';

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('owner/event-types')
  listOwnerEventTypes() {
    return this.eventsService.listOwnerEventTypes();
  }

  @Post('owner/event-types')
  createOwnerEventType(@Body() body: CreateEventTypeDto) {
    return this.eventsService.createOwnerEventType(body);
  }

  @Get('public/event-types')
  listPublicEventTypes() {
    return this.eventsService.listPublicEventTypes();
  }

  @Get('public/event-types/:eventTypeId')
  getPublicEventType(@Param('eventTypeId') eventTypeId: string) {
    return this.eventsService.getPublicEventType(eventTypeId);
  }
}
