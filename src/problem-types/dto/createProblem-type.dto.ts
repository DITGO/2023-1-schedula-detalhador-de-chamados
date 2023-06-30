import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProblemTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  problem_category_id: string;

  visible_user_external: boolean;

  issues_ids: string[];
}
