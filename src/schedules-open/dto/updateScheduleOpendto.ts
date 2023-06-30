import { IsString } from 'class-validator';

export class UpdateScheduleOpenDto {
  alerts: Date[];

  @IsString({ message: 'Informe uma descrição valida' })
  description: string;

  status_e: string;

  dateTime: Date;

  @IsString()
  issue_id: string;
}
