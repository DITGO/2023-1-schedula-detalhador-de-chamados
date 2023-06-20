import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleOpen } from './entities/scheduleOpen.entity';
import { SchedulesOpenController } from './schedulesOpen.controller';
import { SchedulesOpenService } from './schedulesOpen.service';
import { AlertOpen } from './entities/alertOpen.entity';
import { IssueOpenModule } from '../issue-open/issueOpen.module';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleOpen, AlertOpen]), IssueOpenModule],
  controllers: [SchedulesOpenController],
  providers: [SchedulesOpenService],
})
export class ScheduleOpenModule {}
