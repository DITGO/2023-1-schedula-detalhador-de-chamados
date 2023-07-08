import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  async getReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Buffer> {
    // http://localhost:3000/report/?startDate=2021-01-01&endDate=2021-12-31
    const buffer = await this.reportService.getReport(startDate, endDate);

    return buffer;
  }
}
