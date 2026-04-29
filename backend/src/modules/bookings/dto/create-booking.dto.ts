import { IsEmail, IsISO8601, IsString, MinLength } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  eventTypeId!: string;

  @IsISO8601()
  startTime!: string;

  @IsString()
  @MinLength(1)
  guestName!: string;

  @IsEmail()
  guestEmail!: string;
}
