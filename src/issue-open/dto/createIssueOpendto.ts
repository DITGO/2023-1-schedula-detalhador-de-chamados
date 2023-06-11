import { IsNotEmpty } from 'class-validator';

export class CreateIssueOpendto {
  @IsNotEmpty({
    message: 'Solicitante não fornecido',
  })
  requester: string;

  @IsNotEmpty({
    message: 'Telefone não fornecido',
  })
  phone: string;

  @IsNotEmpty({
    message: 'Cidade não fornecido',
  })
  city_id: string;

  @IsNotEmpty({
    message: 'Posto de Trabalho não fornecido',
  })
  workstation_id: string;

  @IsNotEmpty({
    message: 'categoria do Problema não fornecido',
  })
  problem_category_id: string;

  @IsNotEmpty({
    message: 'Tipo do Problema não fornecido',
  })
  problem_types_ids: string[];

  @IsNotEmpty({
    message: 'Data não fornecido',
  })
  date: Date;

  @IsNotEmpty({
    message: 'email não fornecido',
  })
  email: string;

  @IsNotEmpty({
    message: 'Celular não fornecido',
  })
  cellphone: string;

  @IsNotEmpty({
    message: 'Descrição não fornecida',
  })
  description: string;
}
