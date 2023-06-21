import { IsNotEmpty, ValidateIf } from 'class-validator';

function validateNotEmpty(message: string): PropertyDecorator {
  return function (
    target: Record<string, unknown>,
    propertyKey: string | symbol,
  ): void {
    IsNotEmpty({ message })(target, propertyKey);
    ValidateIf((object, value) => value !== null && value !== '')(
      target,
      propertyKey,
    );
  };
}

export class CreateIssueOpendto {
  @validateNotEmpty('Solicitante não foi fornecido')
  requester: string;

  @validateNotEmpty('Telefone não foi fornecido')
  phone: string;

  @validateNotEmpty('Cidade não foi fornecido')
  city_id: string;

  @validateNotEmpty('Posto de Trabalho não foi fornecido')
  workstation_id: string;

  @validateNotEmpty('categoria do Problema não foi fornecido')
  problem_category_id: string;

  @validateNotEmpty('Tipo do Problema não foi fornecido')
  problem_types_ids: string[];

  @validateNotEmpty('Data não foi fornecido')
  date: Date;

  @validateNotEmpty('email não foi fornecido')
  email: string;

  @validateNotEmpty('Celular não foi fornecido')
  cellphone: string;

  @validateNotEmpty('Descrição não foi fornecida')
  description: string;

  dateTime: Date;

}
