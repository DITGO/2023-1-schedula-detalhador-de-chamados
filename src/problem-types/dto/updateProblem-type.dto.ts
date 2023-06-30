import { IsString } from 'class-validator';

export class UpdateProblemTypeDto {
  @IsString()
  name: string;

  @IsString()
  problem_category_id: string;

  visible_user_external: boolean;

  issues_ids: string[];
}
