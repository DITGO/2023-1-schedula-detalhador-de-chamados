import {
  Body,
  CacheInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { IssueOpen } from './entities/issueOpen.entity';
import { IssuesOpenService } from './issueOpen.service';
import { CreateIssueOpendto } from './dto/createIssueOpendto';

@Controller('issuesOpen')
@UseInterceptors(CacheInterceptor)
export class IssuesOpenController {
  constructor(private issuesOpenService: IssuesOpenService) {}

  @Post()
  async createIssueOpen(
    @Body() createIssueOpendto: CreateIssueOpendto,
  ): Promise<IssueOpen> {
    const issueOpen = await this.issuesOpenService.createIssueOpen(
      createIssueOpendto,
    );
    return issueOpen;
  }

  @Get()
  async getIssuesOpen(): Promise<IssueOpen[]> {
    const issuesOpen = await this.issuesOpenService.findIssuesOpen();
    return issuesOpen;
  }

  @Get(':id')
  async getIssueOpen(@Param('id') id: string): Promise<IssueOpen> {
    const issueOpen = await this.issuesOpenService.findIssueOpenById(id);
    return issueOpen;
  }

  @Put(':id')
  async updateIssueOpen(
    @Param('id') id: string,
    @Body() updateIssueOpendto: CreateIssueOpendto,
  ): Promise<IssueOpen> {
    const issueOpen = await this.issuesOpenService.updateIssueOpen(
      updateIssueOpendto,
      id,
    );
    return issueOpen;
  }

  @Delete(':id')
  async deleteIssueOpen(@Param('id') id: string) {
    await this.issuesOpenService.deleteIssueOpen(id);
    return {
      message: 'Agendamento removido com sucesso',
    };
  }
}
