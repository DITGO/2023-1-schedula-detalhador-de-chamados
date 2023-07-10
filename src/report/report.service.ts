import { Injectable } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Issue } from '../issue/entities/issue.entity';
import { IssueOpen } from '../issue-open/entities/issueOpen.entity';
import { join } from 'path';
import PDFDocument from 'pdfkit-table';
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
    // Check if have start date and end date, if not, set default date

    // Convert string to date
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Count all issue in the date range
    const countIssues = await this.issueRepository.count({
      where: {
        date: Between(start, end),
      },
    });

    // Count issue by problem category and problem type
    const countIssuesGrupedByProblemCategoryAndProblemType =
      await this.issueRepository
        .createQueryBuilder('issue')
        .leftJoinAndSelect('issue.problem_category', 'problem_category')
        .leftJoinAndSelect('issue.problem_types', 'problem_types')
        .select('problem_category.name', 'problemCategoryName')
        .addSelect('problem_types.name', 'problemTypeName')
        .addSelect('COUNT(*)', 'count')
        .where('issue.date >= :startDate AND issue.date <= :endDate', {
          startDate,
          endDate,
        })
        .groupBy('problem_category.name')
        .addGroupBy('problem_types.name')
        .orderBy('count', 'DESC')
        .addOrderBy('problem_category.name', 'ASC')
        .addOrderBy('problem_types.name', 'ASC')
        .getRawMany();

    const countIssuesWithSchedule = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoin('issue.schedule', 'schedule')
      .where('issue.date >= :startDate AND issue.date <= :endDate', {
        startDate,
        endDate,
      })
      .andWhere('schedule.id IS NOT NULL')
      .getCount();

    const countIssuesWithoutSchedule = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoin('issue.schedule', 'schedule')
      .where('issue.date >= :startDate AND issue.date <= :endDate', {
        startDate,
        endDate,
      })
      .andWhere('schedule.id IS NULL')
      .getCount();

    const countGroupByEmailIssue = await this.issueRepository
      .createQueryBuilder('issue')
      .select('issue.email', 'email')
      .addSelect('COUNT(*)', 'count')
      .where('issue.date >= :startDate AND issue.date <= :endDate', {
        startDate,
        endDate,
      })
      .groupBy('issue.email')
      .orderBy('count', 'DESC')
      .getRawMany();

    const countSchedules = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoin('issue.schedule', 'schedule')
      .where('issue.date >= :startDate AND issue.date <= :endDate', {
        startDate,
        endDate,
      })
      .getCount();

    const countSchedulesOpen = await this.issueOpenRepository
      .createQueryBuilder('issue_open')
      .leftJoin('issue_open.schedule', 'schedule')
      .where('issue_open.date >= :startDate AND issue_open.date <= :endDate', {
        startDate,
        endDate,
      })
      .getCount();

    const countSchedulesByProblemCategoryAndProblemType =
      await this.issueRepository
        .createQueryBuilder('issue')
        .leftJoinAndSelect('issue.problem_category', 'problem_category')
        .leftJoinAndSelect('issue.problem_types', 'problem_types')
        .leftJoin('issue.schedule', 'schedule')
        .select('problem_category.name', 'problemCategoryName')
        .addSelect('problem_types.name', 'problemTypeName')
        .addSelect('COUNT(*)', 'count')
        .where('issue.date >= :startDate AND issue.date <= :endDate', {
          startDate,
          endDate,
        })
        .andWhere('schedule.id IS NOT NULL')
        .groupBy('problem_category.name')
        .addGroupBy('problem_types.name')
        .orderBy('count', 'DESC')
        .addOrderBy('problem_category.name', 'ASC')
        .addOrderBy('problem_types.name', 'ASC')
        .getRawMany();

    const countSchedulesOpenByProblemCategoryAndProblemType =
      await this.issueOpenRepository
        .createQueryBuilder('issue_open')
        .leftJoinAndSelect('issue_open.problem_category', 'problem_category')
        .leftJoinAndSelect('issue_open.problem_types', 'problem_types')
        .leftJoin('issue_open.schedule', 'schedule')
        .select('problem_category.name', 'problemCategoryName')
        .addSelect('problem_types.name', 'problemTypeName')
        .addSelect('COUNT(*)', 'count')
        .where(
          'issue_open.date >= :startDate AND issue_open.date <= :endDate',
          {
            startDate,
            endDate,
          },
        )
        .andWhere('schedule.id IS NOT NULL')
        .groupBy('problem_category.name')
        .addGroupBy('problem_types.name')
        .orderBy('count', 'DESC')
        .addOrderBy('problem_category.name', 'ASC')
        .addOrderBy('problem_types.name', 'ASC')
        .getRawMany();

    const sumCountSchedulesGroupedByProblems =
      countSchedulesByProblemCategoryAndProblemType.map((item) => {
        const countSchedulesOpen =
          countSchedulesOpenByProblemCategoryAndProblemType.find((item2) => {
            return (
              item2.problemCategoryName === item.problemCategoryName &&
              item2.problemTypeName === item.problemTypeName
            );
          });

        if (!countSchedulesOpen) {
          return item;
        }
        return {
          problemCategoryName: item.problemCategoryName,
          problemTypeName: item.problemTypeName,
          count: parseInt(item.count) + parseInt(countSchedulesOpen.count),
        };
      });

    const countSchedulesByStatus = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoin('issue.schedule', 'schedule')
      .select('schedule.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('issue.date >= :startDate AND issue.date <= :endDate', {
        startDate,
        endDate,
      })
      .andWhere('schedule.id IS NOT NULL')
      .groupBy('schedule.status')
      .getRawMany();

    const countSchedulesOpenByStatus = await this.issueOpenRepository
      .createQueryBuilder('issue_open')
      .leftJoin('issue_open.schedule', 'schedule')
      .select('schedule.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('issue_open.date >= :startDate AND issue_open.date <= :endDate', {
        startDate,
        endDate,
      })
      .andWhere('schedule.id IS NOT NULL')
      .groupBy('schedule.status')
      .getRawMany();

    const sumCountSchedulesGroupedByStatus = countSchedulesByStatus.map(
      (item) => {
        const countSchedulesOpen = countSchedulesOpenByStatus.find((item2) => {
          return item2.status === item.status;
        });

        if (!countSchedulesOpen) {
          return item;
        }
        return {
          status: item.status,
          count: parseInt(item.count) + parseInt(countSchedulesOpen.count),
        };
      },
    );

    // Create example placeholder data for chart

    // NÃO RESOLVIDO = Laranja
    // EM ANDAMENTO = Azul
    // PENDENTE = Amarelo
    // URGENTE = Vermelho
    // RESOLVIDO = Verde

    // Set colors for each status
    const colors = {
      'NÃO RESOLVIDO': '#FFA500',
      'EM ANDAMENTO': '#0000FF',
      'PENDENTE': '#FFFF00',
      'URGENTE': '#FF0000',
      'RESOLVIDO': '#008000',
    };

    // Set data for chart
    const dataSchedulesByStatus = {
      labels: sumCountSchedulesGroupedByStatus.map((item) => item.status),
      datasets: [
        {
          label: 'Schedules by status',
          data: sumCountSchedulesGroupedByStatus.map((item) => item.count),
          backgroundColor: sumCountSchedulesGroupedByStatus.map(
            (item) => colors[item.status],
          ),
          borderColor: sumCountSchedulesGroupedByStatus.map(
            (item) => colors[item.status],
          ),
          borderWidth: 1,
        },
      ],
    };

    const myChart = new ChartJsImage();
    myChart.setConfig({
      type: 'pie',
      data: dataSchedulesByStatus,
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
        autoFirstPage: false,
      });

      let pageNumber = 0;
      doc.on('pageAdded', () => {
        pageNumber++;
        const bottom = doc.page.margins.bottom;

        // Set the header

        doc.image(
          join(process.cwd(), 'assets/logo.png'),
          0.5 * (doc.page.width - 100) + 45 / 2,
          5,
          { fit: [40, 40], align: 'center' },
        );

        doc.font('Helvetica').fontSize(6);
        doc.text(`ESTADO DE GOIÁS`, doc.page.width / 2 - 240, 45, {
          align: 'center',
        });

        doc.font('Helvetica').fontSize(6);
        doc.text(
          `DIRETORIA GERAL DA POLÍCIA CIVIL`,
          doc.page.width / 2 - 240,
          51,
          {
            align: 'center',
          },
        );

        doc.font('Helvetica').fontSize(6);
        doc.text(
          `SUPERINTENDÊNCIA DE GESTÃO INTEGRADA`,
          doc.page.width / 2 - 240,
          57,
          {
            align: 'center',
          },
        );

        doc.font('Helvetica').fontSize(6);
        doc.text(
          `DIVISÃO DE SUPORTE TÉCNICO EM INFORMÁTICA`,
          doc.page.width / 2 - 240,
          63,
          {
            align: 'center',
          },
        );

        // Av. Anhanguera, 7364 - Aeroviario, Goiânia - GO, 74435-300
        // Fone (62) 3201-2558 / 2539 / 2525 / 2500
        // informatica@policiacivil.go.go.br
        doc.page.margins.bottom = 0;
        doc.font('Helvetica').fontSize(6);
        doc.text(
          `Pág. ${pageNumber}`,
          doc.page.width - 100,
          doc.page.height - 50,
          {
            width: 100,
            align: 'center',
            lineBreak: false,
          },
        );

        doc.font('Helvetica').fontSize(6);
        doc.text(
          `Av. Anhanguera, 7364 - Aeroviario, Goiânia - GO, 74435-300`,
          0.5 * (doc.page.width - 200),
          doc.page.height - 45,
          {
            width: 200,
            align: 'center',
            lineBreak: false,
          },
        );

        doc.font('Helvetica').fontSize(6);
        doc.text(
          `Fone (62) 3201-2558 / 2539 / 2525 / 2500`,
          0.5 * (doc.page.width - 200),
          doc.page.height - 38,
          {
            width: 200,
            align: 'center',
            lineBreak: false,
          },
        );

        doc.font('Helvetica').fontSize(6);
        doc.text(
          `informatica@policiacivil.go.go.br`,
          0.5 * (doc.page.width - 200),
          doc.page.height - 31,
          {
            width: 200,
            align: 'center',
            lineBreak: false,
          },
        );

        doc.page.margins.bottom = bottom;
      });

      doc.addPage();
      doc.text('', 50, 80);
      doc.font('Helvetica-Bold').fontSize(20);
      doc.text(
        `Relatório Schedula - ${new Date().toLocaleString('pr-br', {
          timeZone: 'America/Sao_Paulo',
        })}`,
      );
      doc.moveDown();
      doc.font('Helvetica').fontSize(14);
      doc.text(`Relatório filtrado entre ${startDate} e ${endDate}`);
      doc.moveDown();

      doc.font('Helvetica-Bold').fontSize(16);
      doc.text('Atendimentos');
      doc.moveDown(1);

      doc.font('Helvetica-Bold').fontSize(12);
      doc.text(`Total de atendimentos: ${countIssues}`);
      doc.moveDown();

      const option = {
        prepareHeader: () => doc.font('Helvetica-Bold'),
        prepareRow: (row, i) => doc.font('Helvetica').fontSize(12),
        align: 'center',
      };

      if (countIssuesGrupedByProblemCategoryAndProblemType.length > 0) {
        const table_problems = {
          title: 'Total de atendimentos por categoria e tipo de problema',
          headers: [
            'Categoria de problema',
            'Tipo de problema',
            'Total de atendimentos',
          ],
          rows: countIssuesGrupedByProblemCategoryAndProblemType.map(
            (issue) => [
              issue.problemCategoryName,
              issue.problemTypeName,
              issue.count,
            ],
          ),
        };

        doc.table(table_problems, option);
        doc.moveDown(1);
      } else {
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text(`Total de atendimentos por categoria e tipo de problema`);
        doc.font('Helvetica').fontSize(12);
        doc.text(`Não houve atendimentos para o período selecionado.`);
      }

      if (countIssuesWithSchedule > 0 || countIssuesWithoutSchedule > 0) {
        const table_issue_type = {
          title: 'Tipo de atendimento',
          headers: ['Tipo de atendimento', 'Total'],
          rows: [
            ['INTERNO', countIssuesWithoutSchedule.toString()],
            ['EXTERNO', countIssuesWithSchedule.toString()],
          ],
        };

        doc.table(table_issue_type, {
          ...option,
          width: 300,
          columnsSize: [150, 150],
        });
        doc.moveDown();
      } else {
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text(`Tipo de atendimento`);
        doc.font('Helvetica').fontSize(12);
        doc.text(`Não houve atendimentos para o período selecionado.`);
      }

      if (countGroupByEmailIssue.length > 0) {
        const table_email = {
          title: 'Total de atendimentos por e-mail',
          headers: ['E-mail', 'Total de atendimentos'],
          rows: countGroupByEmailIssue.map((issue) => [
            issue.email,
            issue.count,
          ]),
        };

        doc.table(table_email, {
          ...option,
          width: 300,
          columnsSize: [150, 150],
        });
        doc.moveDown();
      } else {
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text(`Total de atendimentos por e-mail`);
        doc.font('Helvetica').fontSize(12);
        doc.text(
          `Não houve atendimentos por e-mail para o período selecionado.`,
        );
      }

      // Agendamentos

      doc.addPage();
      doc.text('', 50, 70);
      doc.moveDown();
      // Go to next page
      doc.font('Helvetica-Bold').fontSize(16);
      doc.text('Agendamentos');
      doc.moveDown(1);

      doc.font('Helvetica-Bold').fontSize(12);
      doc.text(`Total de agendamentos: ${countSchedules + countSchedulesOpen}`);
      doc.moveDown();

      if (sumCountSchedulesGroupedByProblems.length > 0) {
        const table_schedules = {
          title: 'Total de agendamentos por categoria e tipo de problema',
          headers: ['Categoria', 'Tipo de problema', 'Total de agendamentos'],
          rows: sumCountSchedulesGroupedByProblems.map((schedule) => [
            schedule.problemCategoryName,
            schedule.problemTypeName,
            schedule.count,
          ]),
        };

        doc.table(table_schedules, option);
        doc.moveDown();
      } else {
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text(`Total de agendamentos por categoria e tipo de problema`);
        doc.font('Helvetica').fontSize(12);
        doc.text(`Não houve agendamentos para o período selecionado.`);
      }

      doc.font('Helvetica-Bold').fontSize(12);
      doc.text('Gráfico de agendamentos por status:');
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
