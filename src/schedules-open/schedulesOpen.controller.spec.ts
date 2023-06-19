import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesOpenController } from './schedulesOpen.controller';
import { SchedulesOpenService } from './schedulesOpen.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateScheduleOpenDto } from './dto/createScheduleOpendto';
import { UpdateScheduleOpenDto } from './dto/updateScheduleOpendto';
import { CacheModule } from '@nestjs/common';

describe('SchedulesController', () => {
  let controller: SchedulesOpenController;

  const mockUuid = uuidv4();

  const mockCreateScheduleDto: CreateScheduleOpenDto = {
    issue_id: '123',
    alerts: [
      new Date('2022-12-17T17:55:20.565'),
      new Date('2022-12-18T18:55:20.565'),
    ],
    description: 'Uma descrição valida',
    status_e: 'PROGRESS',
    dateTime: new Date('2022-12-17T17:55:20.565'),
  };

  const mockUpdateScheduleDto: UpdateScheduleOpenDto = {
    issue_id: '123',
    description: 'Outra descrição valida',
    status_e: 'CLOSED',
    alerts: [new Date('2022-12-19T19:55:20.565')],
    dateTime: new Date('2022-12-17T17:55:20.565'),
  };

  const mockSchedulesService = {
    createSchedule: jest.fn((dto) => {
      return {
        ...dto,
      };
    }),
    findSchedules: jest.fn(() => {
      return [{ ...mockCreateScheduleDto }];
    }),
    findScheduleById: jest.fn((id) => {
      return {
        id,
        ...mockCreateScheduleDto,
      };
    }),
    updateSchedule: jest.fn((dto, id) => {
      return {
        ...dto,
        id,
      };
    }),
    deleteSchedule: jest.fn(() => {
      return {
        message: 'Agendamento removido com sucesso',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulesOpenController],
      providers: [SchedulesOpenService],
      imports: [CacheModule.register()],
    })

      .overrideProvider(SchedulesOpenService)
      .useValue(mockSchedulesService)
      .compile();

    controller = module.get<SchedulesOpenController>(SchedulesOpenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a schedule', async () => {
    const dto = mockCreateScheduleDto;
    const response = await controller.createScheduleOpen(dto);
    expect(response).toMatchObject({ ...dto });
  });

  it('should return all schedules', async () => {
    const response = await controller.getScheduleOpen();
    expect(response.length).toBeGreaterThan(0);
    expect(response).toEqual([{ ...mockCreateScheduleDto }]);
  });

  it('should return a schedule with the respective id', async () => {
    const scheduleId = mockUuid;
    const response = await controller.getScheduleOpen(scheduleId);
    expect(response).toMatchObject({ id: scheduleId });
  });

  it('should update a schedule', async () => {
    const scheduleId = mockUuid;
    const dto = mockUpdateScheduleDto;
    const response = await controller.updateScheduleOpen(scheduleId, dto);
    expect(response).toMatchObject({ id: scheduleId, ...dto });
  });

  it('should delete a schedule', async () => {
    const scheduleId = mockUuid;
    const successMessage = 'Agendamento removido com sucesso';
    const response = await controller.deleteScheduleOpen(scheduleId);
    expect(response).toMatchObject({ message: successMessage });
  });
});
