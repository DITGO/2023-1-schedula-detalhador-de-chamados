import {
  Body,
  CacheInterceptor,
  ConsoleLogger,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ScheduleOpen } from './entities/scheduleOpen.entity';
import { SchedulesOpenService } from './schedulesOpen.service';
import { CreateScheduleOpenDto } from './dto/createScheduleOpendto';
import { UpdateScheduleOpenDto } from './dto/updateScheduleOpendto';

@Controller('schedules-open')
@UseInterceptors(CacheInterceptor)
export class SchedulesOpenController {
  constructor(private schedulesOpenService: SchedulesOpenService) {}

  @Post()
  async createScheduleOpen(
    @Body() createScheduleOpenDto: CreateScheduleOpenDto,
  ): Promise<ScheduleOpen> {
    const schedule = await this.schedulesOpenService.createScheduleOpen(
      createScheduleOpenDto,
    );
    return schedule;
  }

  @Get()
  async getSchedulesOpen(): Promise<ScheduleOpen[]> {
    const schedules = await this.schedulesOpenService.findSchedulesOpen();
    return schedules;
  }

  @Get(':id')
  async getScheduleOpen(@Param('id') id: string): Promise<ScheduleOpen> {
    const schedule = await this.schedulesOpenService.findScheduleOpenById(id);
    return schedule;
  }

  @Put(':id')
  async updateScheduleOpen(
    @Param('id') id: string,
    @Body() updateScheduledto: UpdateScheduleOpenDto,
  ): Promise<ScheduleOpen> {
    const schedule = await this.schedulesOpenService.updateScheduleOpen(
      updateScheduledto,
      id,
    );
    return schedule;
  }

  @Delete(':id')
  async deleteScheduleOpen(@Param('id') id: string) {
    await this.schedulesOpenService.deleteScheduleOpen(id);
    return {
      message: 'Agendamento removido com sucesso',
    };
  }
}
