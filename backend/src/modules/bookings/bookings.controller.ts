import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { GetSlotsQueryDto } from './dto/get-slots-query.dto';
import { BookingsService } from './bookings.service';
import { SlotsService } from '../slots/slots.service';

@Controller()
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly slotsService: SlotsService,
  ) {}

  @Get('owner/bookings/upcoming')
  listUpcomingBookings() {
    return this.bookingsService.listUpcomingBookings();
  }

  @Get('public/event-types/:eventTypeId/slots')
  getSlots(
    @Param('eventTypeId') eventTypeId: string,
    @Query() query: GetSlotsQueryDto,
  ) {
    return this.slotsService.getSlots(eventTypeId, query);
  }

  @Post('public/bookings')
  createBooking(@Body() body: CreateBookingDto) {
    return this.bookingsService.createBooking(body);
  }
}
