import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IssueOpen } from './entities/issueOpen.entity';
import { CreateIssueOpendto } from './dto/createIssueOpendto';
import { UpdateIssueOpendto } from './dto/updateIssueOpendto';
import { ProblemType } from '../problem-types/entities/problem-type.entity';
import { ProblemTypesService } from '../problem-types/problem-types.service';
import { ProblemCategory } from '../problem-category/entities/problem-category.entity';
import { ProblemCategoryService } from '../problem-category/problem-category.service';
import { SendMailIssueOpendto } from './dto/sendMailIssueOpendto';
import { createTransport } from 'nodemailer';
import { AlertIssueOpen } from './entities/alertIssueOpen.entity';

@Injectable()
export class IssuesOpenService {
  constructor(
    @InjectRepository(IssueOpen)
    private IssueOpenRepo: Repository<IssueOpen>,
    @InjectRepository(AlertIssueOpen)
    private alertIssueOpenRepo: Repository<AlertIssueOpen>,
    @Inject(forwardRef(() => ProblemTypesService))
    private problem_types_service: ProblemTypesService,
    @Inject(forwardRef(() => ProblemCategoryService))
    private problem_category_service: ProblemCategoryService,
  ) {}

  createAlerts(dates: Date[]): AlertIssueOpen[] {
    const alerts: AlertIssueOpen[] = [];

    dates.forEach((date) => {
      const alert = this.alertIssueOpenRepo.create();
      alert.date = date;
      alerts.push(alert);
    });

    return alerts;
  }

  async updateProblemTypes(
    problem_types_ids: string[],
  ): Promise<ProblemType[]> {
    const problem_types: ProblemType[] = [];
    for (const problemTypeId of problem_types_ids) {
      const problem_type = await this.problem_types_service.findProblemType(
        problemTypeId,
      );
      problem_types.push(problem_type);
    }
    return problem_types;
  }

  async createIssueOpen(
    createIssueOpendto: CreateIssueOpendto,
  ): Promise<IssueOpen> {
    const alerts: AlertIssueOpen[] = createIssueOpendto.alerts
      ? this.createAlerts(createIssueOpendto.alerts)
      : [];
    const problem_category: ProblemCategory =
      await this.problem_category_service.findProblemCategoryById(
        createIssueOpendto.problem_category_id,
      );
    const problem_types: ProblemType[] = await this.updateProblemTypes(
      createIssueOpendto.problem_types_ids,
    );
    createIssueOpendto.isHomolog = false;
    const issueOpen = this.IssueOpenRepo.create({
      ...createIssueOpendto,
      alerts,
      problem_category,
      problem_types,
    });
    try {
      return await this.IssueOpenRepo.save(issueOpen);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findIssuesOpen(): Promise<IssueOpen[]> {
    const issuesOpen = await this.IssueOpenRepo.find({
      relations: ['alerts', 'problem_category', 'problem_types'],
    });
    if (!issuesOpen)
      throw new NotFoundException('Não existem Agendamentos cadastrados');
    return issuesOpen;
  }

  async findIssueOpenById(issueOpenId: string): Promise<IssueOpen> {
    const IssueOpen = await this.IssueOpenRepo.findOne({
      where: { id: issueOpenId },
      relations: ['alerts', 'problem_category', 'problem_types'],
    });
    if (!IssueOpen) throw new NotFoundException('Agendamento não encontrado');
    return IssueOpen;
  }

  async updateIssueOpen(
    updateIssueOpendto: UpdateIssueOpendto,
    issueOpenId: string,
  ): Promise<IssueOpen> {
    const issueOpen = await this.IssueOpenRepo.findOneBy({
      id: issueOpenId,
    });

    try {
      const alerts: AlertIssueOpen[] = updateIssueOpendto.alerts
        ? this.createAlerts(updateIssueOpendto.alerts)
        : issueOpen.alerts;
      const problem_category: ProblemCategory =
        updateIssueOpendto.problem_category_id
          ? await this.problem_category_service.findProblemCategoryById(
              updateIssueOpendto.problem_category_id,
            )
          : issueOpen.problem_category;
      const problem_types: ProblemType[] = updateIssueOpendto.problem_types_ids
        ? await this.updateProblemTypes(updateIssueOpendto.problem_types_ids)
        : issueOpen.problem_types;
      await this.IssueOpenRepo.save({
        id: issueOpenId,
        ...updateIssueOpendto,
        alerts,
        problem_category,
        problem_types,
      });
      return await this.IssueOpenRepo.findOneBy({
        id: issueOpenId,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteIssueOpen(issueOpenId: string) {
    const result = await this.IssueOpenRepo.delete({ id: issueOpenId });
    if (result.affected === 0) {
      throw new NotFoundException(
        'Não foi encontrado um Agendamento com este id',
      );
    }
  }

  async updateHomologIssueOpen(issueOpenId: string) {
    const issueOpen = await this.IssueOpenRepo.findOneBy({
      id: issueOpenId,
    });
    try {
      await this.IssueOpenRepo.save({
        id: issueOpenId,
        isHomolog: !issueOpen.isHomolog,
      });
      return await this.IssueOpenRepo.findOneBy({
        id: issueOpenId,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async sendMailIssueOpen(sendMailIssueOpendto: SendMailIssueOpendto) {
    const transporter = createTransport({
      secure: true,
      service: process.env.SERVICE_SMTP,
      auth: {
        user: process.env.USER_SMTP,
        pass: process.env.PASS_SMTP,
      },
    });

    const mailOptions = {
      from: process.env.USER_SMTP, // sender address
      to: [sendMailIssueOpendto.targetMail], // receiver (use array of string for a list)
      subject: 'Status do agendamento aberto - Schedula', // Subject line
      html: `<p>${sendMailIssueOpendto.justify}</p>`, // plain text body
    };

    transporter.sendMail(mailOptions, (err: Error | null, info: any) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });
  }
}
