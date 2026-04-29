import { IsDateString } from 'class-validator';

export class GetSlotsQueryDto {
  @IsDateString({ strict: true })
  dateFrom!: string;

  @IsDateString({ strict: true })
  dateTo!: string;
}
