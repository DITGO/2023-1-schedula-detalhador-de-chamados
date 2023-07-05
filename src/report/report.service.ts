import { Injectable } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Issue } from '../issue/entities/issue.entity';
import { IssueOpen } from 'src/issue-open/entities/issueOpen.entity';
const PDFDocument = require('pdfkit-table');
const ChartJsImage = require('chartjs-to-image');

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
    @InjectRepository(IssueOpen)
    private readonly issueOpenRepository: Repository<IssueOpen>,
  ) {}

  async getReport(startDate: string, endDate: string): Promise<Buffer> {
    // return `Date range: ${startDate} - ${endDate}`;

    // Count all issue in the date range
    const countIssues = await this.issueRepository
      .createQueryBuilder('issue')
      .where('issue.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getCount();

    // Count issue by problem category and problem type
    const countIssuesByProblemCategoryAndProblemType =
      await this.issueRepository
        .createQueryBuilder('issue')
        .select('problem_category.name', 'problemCategoryName')
        .addSelect('problem_type.name', 'problemTypeName')
        .addSelect('COUNT(*)', 'count')
        .innerJoin('issue.problem_category', 'problem_category')
        .innerJoin('issue.problem_types', 'problem_type')
        .where('issue.date BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .groupBy('problem_category.name')
        .addGroupBy('problem_type.name')
        .getRawMany();

    const countIssuesWithSchedule = await this.issueRepository
      .createQueryBuilder('issue')
      .innerJoin('issue.schedule', 'schedule')
      .where('issue.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getCount();

    const countIssuesWithoutSchedule = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoin('issue.schedule', 'schedule')
      .where('issue.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('schedule.id IS NULL')
      .getCount();

    const countGroupByEmailIssue = await this.issueRepository
      .createQueryBuilder('issue')
      .select('issue.email', 'email')
      .addSelect('COUNT(*)', 'count')
      .where('issue.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('issue.email')
      .getRawMany();

    const countSchedules = await this.issueRepository
      .createQueryBuilder('issue')
      .innerJoin('issue.schedule', 'schedule')
      .where('issue.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    const countSchedulesOpen = await this.issueOpenRepository
      .createQueryBuilder('issue_open')
      .innerJoin('issue_open.schedule', 'schedule')
      .where('issue_open.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getCount();

    const countSchedulesByProblemCategoryAndProblemType =
      await this.issueRepository
        .createQueryBuilder('issue')
        .select('problem_category.name', 'problemCategoryName')
        .addSelect('problem_type.name', 'problemTypeName')
        .addSelect('COUNT(*)', 'count')
        .innerJoin('issue.problem_category', 'problem_category')
        .innerJoin('issue.problem_types', 'problem_type')
        .innerJoin('issue.schedule', 'schedule')
        .where('issue.date BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .groupBy('problem_category.name')
        .addGroupBy('problem_type.name')
        .getRawMany();

    // Create example placeholder data for chart

    const data = {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [
        {
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132)',
            'rgba(54, 162, 235)',
            'rgba(255, 206, 86)',
            'rgba(75, 192, 192)',
            'rgba(153, 102, 255)',
            'rgba(255, 159, 64)',
          ],

          borderWidth: 1,
        },
      ],
    };

    const myChart = new ChartJsImage();
    myChart.setConfig({
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Chart.js Pie Chart',
          },
        },
      },
    });

    myChart.setWidth(600);
    myChart.setHeight(400);

    const plotImage = await myChart.toBinary();

    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        bufferPages: true,
      });

      //todo
      doc.text('PDF Gerado com sucesso');
      doc.moveDown();

      doc.text('Este PDF foi gerado automaticamente pelo sistema Schedula.');
      doc.moveDown();

      doc.text(
        `Data de geração: ${new Date().toLocaleString('pr-br', {
          timeZone: 'America/Sao_Paulo',
        })}`,
      );
      doc.moveDown();

      const option = {
        prepareHeader: () => doc.font('Helvetica-Bold'),
        prepareRow: (row, i) => doc.font('Helvetica').fontSize(12),
        align: 'center',
      };

      // Atendimentos

      doc.text(`Total de atendimentos: ${countIssues}`);
      doc.moveDown();

      doc.text('Total de atendimentos por categoria e tipo de problema:');
      doc.moveDown();

      const table_problems = {
        title: 'Total de atendimentos por categoria e tipo de problema',
        headers: ['Categoria', 'Tipo de problema', 'Total de atendimentos'],
        rows: countIssuesByProblemCategoryAndProblemType.map((issue) => [
          issue.problemCategoryName,
          issue.problemTypeName,
          issue.count,
        ]),
      };

      doc.table(table_problems, option);
      doc.moveDown();

      const table_issue_type = {
        title: 'Tipo de atendimento',
        headers: ['Tipo de atendimento', 'Total'],
        rows: [
          ['INTERNO', countIssuesWithoutSchedule],
          ['EXTERNO', countIssuesWithSchedule],
        ],
      };

      doc.table(table_issue_type, option);
      doc.moveDown();

      const table_email = {
        title: 'Total de atendimentos por e-mail',
        headers: ['E-mail', 'Total de atendimentos'],
        rows: countGroupByEmailIssue.map((issue) => [issue.email, issue.count]),
      };

      doc.table(table_email, option);
      doc.moveDown();

      // Agendamentos

      doc.text('Total de agendamentos:');
      doc.moveDown();

      doc.text(`Total de agendamentos abertos: ${countSchedulesOpen}`);
      doc.moveDown();

      doc.text('Total de agendamentos por categoria e tipo de problema:');
      doc.moveDown();

      const table_schedules = {
        title: 'Total de agendamentos por categoria e tipo de problema',
        headers: ['Categoria', 'Tipo de problema', 'Total de agendamentos'],
        rows: countSchedulesByProblemCategoryAndProblemType.map((issue) => [
          issue.problemCategoryName,
          issue.problemTypeName,
          issue.count,
        ]),
      };

      doc.table(table_schedules, option);
      doc.moveDown();

      // Next page
      doc.addPage();

      doc.text('Gráfico de agendamentos por categoria e tipo de problema:');
      doc.moveDown();
      doc.image(plotImage, { fit: [500, 300], align: 'center' });

      const buffer = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => {
        const data = Buffer.concat(buffer);
        resolve(data);
      });
      doc.end();
    });

    return pdfBuffer;
  }
}
