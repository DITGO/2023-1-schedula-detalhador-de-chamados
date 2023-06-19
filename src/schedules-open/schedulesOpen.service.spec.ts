import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { SchedulesOpenService } from './schedulesOpen.service';
import { ScheduleOpen } from './entities/scheduleOpen.entity';
import { CreateScheduleOpenDto } from './dto/createScheduleOpendto';
import { UpdateScheduleOpenDto } from './dto/updateScheduleOpendto';
import { IssuesService } from '../issue/issue.service';
import { CreateIssueOpendto } from '../issue-open/dto/createIssueOpendto';

describe('SchedulesService', () => {
  let schedulesService: SchedulesOpenService;
  let schedulesRepository: Repository<ScheduleOpen>;

  const mockUuid = uuid();

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

  const schedulesEntityList = [
    { ...mockCreateScheduleDto, ...mockUpdateScheduleDto },
  ];

  const mockCreateIssueOpendto: CreateIssueOpendto = {
    requester: 'Mockerson',
    phone: '61988554474',
    city_id: 'Brasilia',
    workstation_id: 'DF',
    problem_category_id: 'Category Mock',
    problem_types_ids: ['Type Mock'],
    date: new Date(),
    email: 'mockerson@mock.com',
  };

  const mockIssuesOpenService = {
    createIssue: jest.fn((dto) => {
      return {
        ...dto,
      };
    }),
    findIssues: jest.fn(() => {
      return [{ ...mockCreateIssueOpendto }];
    }),
    findIssueById: jest.fn((id) => {
      return {
        id,
        ...mockCreateIssueOpendto,
      };
    }),
    updateIssue: jest.fn((dto, id) => {
      return {
        ...dto,
        id,
      };
    }),
    deleteIssue: jest.fn(() => {
      return {
        message: 'Chamado removido com sucesso',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulesOpenService,
        IssuesService,
        {
          provide: getRepositoryToken(ScheduleOpen),
          useValue: {
            create: jest.fn((dto: CreateScheduleOpenDto) => {
              return {
                id: uuid(),
                ...dto,
              };
            }),
            find: jest.fn().mockResolvedValue(schedulesEntityList),
            findOne: jest.fn().mockResolvedValue(schedulesEntityList[0]),
            delete: jest.fn(() => {
              return { affected: 1 };
            }),
            findOneBy: jest.fn().mockResolvedValue(mockUpdateScheduleDto),
            save: jest.fn(),
          },
        },
      ],
    })
      .overrideProvider(IssuesService)
      .useValue(mockIssuesService)
      .compile();

    schedulesService = module.get<SchedulesService>(SchedulesService);
    schedulesRepository = module.get<Repository<Schedule>>(
      getRepositoryToken(Schedule),
    );
  });

  it('should be defined', () => {
    expect(schedulesService).toBeDefined();
    expect(schedulesRepository).toBeDefined();
  });

  describe('createSchedule', () => {
    const dto = mockCreateScheduleDto;

    it('should create a schedule with success', async () => {
      const response = await schedulesService.createSchedule(dto);
      expect(response).toHaveProperty('id');
    });

    it('should throw an internal server error when schedule cannot be saved', async () => {
      jest
        .spyOn(schedulesRepository, 'save')
        .mockRejectedValueOnce(new Error());

      expect(schedulesService.createSchedule({ ...dto })).rejects.toThrowError(
        InternalServerErrorException,
      );
    });
  });

  describe('updateSchedule', () => {
    const dto = mockUpdateScheduleDto;
    const id = uuid();
    it('should update a schedule with success', async () => {
      const response = await schedulesService.updateSchedule(dto, id);
      expect(response).toMatchObject({ ...mockUpdateScheduleDto });
    });

    it('should throw an internal server error when schedule cannot be updated', () => {
      jest
        .spyOn(schedulesRepository, 'save')
        .mockRejectedValueOnce(new Error());

      expect(schedulesService.updateSchedule(dto, id)).rejects.toThrowError(
        InternalServerErrorException,
      );
    });
  });

  describe('findSchedules', () => {
    it('should return a schedule entity list successfully', async () => {
      const response = await schedulesService.findSchedules();

      expect(response).toEqual(schedulesEntityList);
      expect(schedulesRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception', async () => {
      jest.spyOn(schedulesRepository, 'find').mockResolvedValueOnce(null);

      expect(schedulesService.findSchedules()).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('findScheduleById', () => {
    const id = mockUuid;

    it('should return a schedule entity successfully', async () => {
      const response = await schedulesService.findScheduleById(id);

      expect(response).toEqual(schedulesEntityList[0]);
    });

    it('should throw a not found exception', () => {
      jest.spyOn(schedulesRepository, 'findOne').mockResolvedValueOnce(null);

      expect(schedulesService.findScheduleById(id)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('deleteSchedule', () => {
    it('should return a not found exception', () => {
      const id = mockUuid;

      jest
        .spyOn(schedulesRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);
      expect(schedulesService.deleteSchedule(id)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
