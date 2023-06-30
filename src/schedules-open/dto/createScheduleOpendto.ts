import { IsNotEmpty, IsString } from 'class-validator';

export class CreateScheduleOpenDto {
  alerts: Date[];

  @IsString({ message: 'Informe uma descrição valida' })
  description: string;

  @IsNotEmpty({
    message: 'Status não fornecido',
  })
  @IsString()
  status_e: string;

  @IsNotEmpty()
  dateTime: Date;

  @IsString()
  @IsNotEmpty()
  issue_id: string;
}
