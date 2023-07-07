import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from '../issue/entities/issue.entity';
import { IssueOpen } from '../issue-open/entities/issueOpen.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { ScheduleOpen } from '../schedules-open/entities/scheduleOpen.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Issue, Issue, Schedule, ScheduleOpen]),
  ],
  controllers: [ReportController],
  providers: [ReportService]
})
export class ReportModule {}
