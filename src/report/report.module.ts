import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from '../issue/entities/issue.entity';
import { IssueOpen } from '../issue-open/entities/issueOpen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Issue, IssueOpen])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
