import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleOpen } from './entities/scheduleOpen.entity';
import { AlertOpen } from './entities/alertOpen.entity';
import { CreateScheduleOpenDto } from './dto/createScheduleOpendto';
import { ScheduleOpenStatus } from './scheduleOpen-status.enum';
import { IssuesOpenService } from '../issue-open/issueOpen.service';
import { UpdateScheduleOpenDto } from './dto/updateScheduleOpendto';
import { IssueOpen } from '../issue-open/entities/issueOpen.entity';

@Injectable()
export class SchedulesOpenService {
  constructor(
    @InjectRepository(ScheduleOpen)
    private scheduleOpenRepo: Repository<ScheduleOpen>,
    @InjectRepository(ScheduleOpen)
    private alertRepo: Repository<AlertOpen>,
    private issuesOpenService: IssuesOpenService,
  ) {}

  createAlerts(dates: Date[]): AlertOpen[] {
    const alerts: AlertOpen[] = [];

    dates.forEach((date) => {
      const alert = this.alertRepo.create();
      alert.date = date;
      alerts.push(alert);
    });

    return alerts;
  }

  async createScheduleOpen(dto: CreateScheduleOpenDto): Promise<ScheduleOpen> {
    console.log('Issue ID:', dto.issue_id);
    const alerts: AlertOpen[] = dto.alerts ? this.createAlerts(dto.alerts) : [];
    const issue: IssueOpen = await this.issuesOpenService.findIssueOpenById(dto.issue_id);
    const status: ScheduleOpenStatus = ScheduleOpenStatus[dto.status_e];
    const schedule = this.scheduleOpenRepo.create({
      ...dto,
      alerts,
      issue,
      status,
    });
    try {
      await this.scheduleOpenRepo.save(schedule);
      return schedule;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findSchedulesOpen(): Promise<ScheduleOpen[]> {
    const schedules = await this.scheduleOpenRepo.find({
      relations: ['alerts', 'issue'],
    });
    if (!schedules)
      throw new NotFoundException('Não existem agendamentos cadastrados');
    return schedules;
  }

  async findScheduleOpenById(scheduleId: string): Promise<ScheduleOpen> {
    const schedule = await this.scheduleOpenRepo.findOne({
      where: { id: scheduleId },
      relations: ['alerts', 'issue'],
    });
    if (!schedule) throw new NotFoundException('Agendamento não encontrado');
    return schedule;
  }

  async updateScheduleOpen(
    dto: UpdateScheduleOpenDto,
    scheduleId: string,
  ): Promise<ScheduleOpen> {
    const schedule = await this.scheduleOpenRepo.findOneBy({
      id: scheduleId,
    });
    try {
      const alerts: AlertOpen[] = dto.alerts
        ? this.createAlerts(dto.alerts)
        : schedule.alerts;
      const issue: IssueOpen = dto.issue_id
        ? await this.issuesOpenService.findIssueOpenById(dto.issue_id)
        : schedule.issue;
      const status: ScheduleOpenStatus = ScheduleOpenStatus[dto.status_e];
      await this.scheduleOpenRepo.save({ id: scheduleId, alerts, issue, status });
      return await this.scheduleOpenRepo.findOneBy({
        id: scheduleId,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteScheduleOpen(scheduleId: string) {
    const result = await this.scheduleOpenRepo.delete({ id: scheduleId });
    if (result.affected === 0) {
      throw new NotFoundException(
        'Nao foi encontrado um agendamento com este id',
      );
    }
  }
}
