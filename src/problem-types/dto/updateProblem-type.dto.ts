import { IsString } from 'class-validator';

export class UpdateProblemTypeDto {
  @IsString()
  name: string;

  @IsString()
  problem_category_id: string;

  issues_ids: string[];
}
