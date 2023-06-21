import { IsNotEmpty, IsString } from 'class-validator';

export class SendMailIssueOpendto {

  @IsNotEmpty({
    message: 'E-mail de destinatário não fornecido',
  })
  @IsString({ message: 'Informe um e-mail de destinatário valido' })
  targetMail: string;

  @IsNotEmpty({
    message: 'Justificativa não fornecida',
  })
  @IsString({ message: 'Informe uma justificativa valida' })
  justify: string;


}
