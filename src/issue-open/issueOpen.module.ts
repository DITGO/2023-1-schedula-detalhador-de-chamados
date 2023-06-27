import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssueOpen } from './entities/issueOpen.entity';
import { IssuesOpenController } from './issueOpen.controller';
import { IssuesOpenService } from './issueOpen.service';
import { ProblemCategoryModule } from '../problem-category/problem-category.module';
import { ProblemTypesModule } from '../problem-types/problem-types.module';
import { ProblemCategory } from '../problem-category/entities/problem-category.entity';
import { ProblemType } from '../problem-types/entities/problem-type.entity';
import { AlertIssueOpen } from './entities/alertIssueOpen.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([IssueOpen, AlertIssueOpen, ProblemCategory, ProblemType]),
    forwardRef(() => ProblemCategoryModule),
    forwardRef(() => ProblemTypesModule),
  ],
  controllers: [IssuesOpenController],
  providers: [IssuesOpenService],
  exports: [IssuesOpenService],
})
export class IssueOpenModule {}
