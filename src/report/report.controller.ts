import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  async getReport(
    @Res() res,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<void> {
    // http://localhost:3000/report/?startDate=2021-01-01&endDate=2021-12-31
    const buffer = await this.reportService.getReport(startDate, endDate);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=RELATÓRIO-${new Date().toLocaleString(
        'pr-br',
        { timeZone: 'America/Sao_Paulo' },
      )}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
