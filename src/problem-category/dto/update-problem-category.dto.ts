import { PartialType } from '@nestjs/mapped-types';
import { CreateProblemCategoryDto } from './create-problem-category.dto';

export class UpdateProblemCategoryDto extends PartialType(
  CreateProblemCategoryDto,
) {
  name: string;
  description: string;
  visible_user_external: boolean;
  problem_types_ids: string[];
}
