import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { Alert } from './entities/alert.entity';
import { CreateScheduleDto } from './dto/createScheduledto';
import { ScheduleStatus } from './schedule-status.enum';
import { IssuesService } from '../issue/issue.service';
import { UpdateScheduleDto } from './dto/updateScheduledto';
import { Issue } from '../issue/entities/issue.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(Schedule)
    private alertRepo: Repository<Alert>,
    private issuesService: IssuesService,
  ) {}

  createAlerts(dates: Date[]): Alert[] {
    const alerts: Alert[] = [];

    dates.forEach((date) => {
      const alert = this.alertRepo.create();
      alert.date = date;
      alerts.push(alert);
    });

    return alerts;
  }

  async createSchedule(dto: CreateScheduleDto): Promise<Schedule> {
    const alerts: Alert[] = dto.alerts ? this.createAlerts(dto.alerts) : [];
    const issue: Issue = await this.issuesService.findIssueById(dto.issue_id);
    const status: ScheduleStatus = ScheduleStatus[dto.status_e];
    const schedule = this.scheduleRepo.create({
      ...dto,
      alerts,
      issue,
      status,
    });
    try {
      await this.scheduleRepo.save(schedule);
      return schedule;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findSchedules(): Promise<Schedule[]> {
    const schedules = await this.scheduleRepo.find({
      relations: ['alerts', 'issue'],
    });
    if (!schedules)
      throw new NotFoundException('Não existem agendamentos cadastrados');
    return schedules;
  }

  async findScheduleById(scheduleId: string): Promise<Schedule> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId },
      relations: ['alerts', 'issue'],
    });
    if (!schedule) throw new NotFoundException('Agendamento não encontrado');
    return schedule;
  }

  async updateSchedule(
    dto: UpdateScheduleDto,
    scheduleId: string,
  ): Promise<Schedule> {
    const schedule = await this.scheduleRepo.findOneBy({
      id: scheduleId,
    });
    try {      
      const alerts: Alert[] = dto.alerts
        ? this.createAlerts(dto.alerts)
        : schedule.alerts;
      const issue: Issue = dto.issue_id
        ? await this.issuesService.findIssueById(dto.issue_id)
        : schedule.issue;
      const status: ScheduleStatus = ScheduleStatus[dto.status_e];
      const description = dto.description;
      const dateTime = dto.dateTime;

      await this.scheduleRepo.save({ id: scheduleId, alerts, issue, status, description, dateTime});
      return await this.scheduleRepo.findOneBy({
        id: scheduleId,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteSchedule(scheduleId: string) {
    const result = await this.scheduleRepo.delete({ id: scheduleId });
    if (result.affected === 0) {
      throw new NotFoundException(
        'Nao foi encontrado um agendamento com este id',
      );
    }
  }
}
