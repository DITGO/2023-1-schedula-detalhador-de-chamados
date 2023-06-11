import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateIssueOpendto } from './dto/createIssueOpendto';
import { UpdateIssueOpendto } from './dto/updateIssueOpendto';
import { IssueOpen } from './entities/issueOpen.entity';
import { IssuesOpenService } from './issueOpen.service';
import { ProblemTypesService } from '../problem-types/problem-types.service';
import { ProblemCategoryService } from '../problem-category/problem-category.service';

describe('IssuesOpenService', () => {
  let issuesOpenService: IssuesOpenService;
  let issuesOpenRepository: Repository<IssueOpen>;
  const date = new Date('2022-12-17T17:55:20.565');

  const mockUuid = uuidv4();

  const mockProblemCategory = {
    id: mockUuid,
    name: 'mockProblemCategory',
    description: 'mockProblemCategoryDescription',
    problem_types: null,
    issuesOpen: null,
  };

  const mockProblemType = {
    name: 'mockProblemType',
  };

  const mockIssueOpen = {
    requester: 'mockerson',
    phone: '61983445521',
    city_id: 'Brasilia',
    workstation_id: '456',
    problem_category: mockProblemCategory,
    problem_types: [mockProblemType],
    email: 'mockerson@mock.com',
    date: date,
    description:"Description Mock",
    cellphone:"4002-8922",
  };

  const mockCreateIssueOpendto: CreateIssueOpendto = {
    requester: 'Mockerson',
    phone: '61988554474',
    city_id: '123',
    workstation_id: '456',
    problem_category_id: '789',
    problem_types_ids: ['type'],
    date: date,
    email: 'mockerson@mock.com',
    description:"Description Mock",
    cellphone:"4002-8922",
  };

  const mockUpdateIssueOpenDto: UpdateIssueOpendto = {
    requester: 'Mockerson',
    phone: '61988554474',
    city_id: '123',
    workstation_id: '456',
    problem_category_id: '789',
    problem_types_ids: ['type'],
    date: date,
    email: 'mockerson@mock.com',
    description:"Description Mock",
    cellphone:"4002-8922",
  };

  const usersEntityList = [{ ...mockCreateIssueOpendto }];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssuesOpenService,
        {
          provide: getRepositoryToken(IssueOpen),
          useValue: {
            create: jest.fn().mockResolvedValue(new IssueOpen()),
            find: jest.fn().mockResolvedValue(usersEntityList),
            findOne: jest.fn().mockResolvedValue(usersEntityList[0]),
            findOneBy: jest.fn().mockResolvedValue(usersEntityList[0]),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            save: jest.fn(),
            update: jest.fn().mockResolvedValue(mockUpdateIssueOpenDto),
          },
        },
        {
          provide: ProblemCategoryService,
          useValue: {
            createProblemCategory: jest
              .fn()
              .mockResolvedValue(mockProblemCategory),
            findProblemCategories: jest
              .fn()
              .mockResolvedValue([{ ...mockProblemCategory }]),
            findProblemCategoryById: jest
              .fn()
              .mockResolvedValue(mockProblemCategory),
            updateProblemCategory: jest
              .fn()
              .mockResolvedValue(mockProblemCategory),
            deleteProblemCategory: jest
              .fn()
              .mockResolvedValue('Categoria de problema excluída com sucesso'),
          },
        },
        {
          provide: ProblemTypesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([{ ...mockProblemType }]),
            findProblemType: jest.fn().mockResolvedValue(mockProblemType),
            createProblemType: jest.fn().mockResolvedValue(mockProblemType),
            updateProblemType: jest.fn().mockResolvedValue(mockProblemType),
            deleteProblemType: jest.fn(),
          },
        },
      ],
    }).compile();

    issuesOpenService = module.get<IssuesOpenService>(IssuesOpenService);
    issuesOpenRepository = module.get<Repository<IssueOpen>>(getRepositoryToken(IssueOpen));
  });

  it('should be defined', () => {
    expect(issuesOpenRepository).toBeDefined();
    expect(issuesOpenService).toBeDefined();
  });

  describe('createIssueOpen', () => {
    const dto = mockCreateIssueOpendto;
    it('should call issueOpen repository with correct params', async () => {
      await issuesOpenService.createIssueOpen(dto);
      expect(issuesOpenRepository.create);
    });

    it('should call issueOpen repository save function with correct params', async () => {
      jest.spyOn(issuesOpenRepository, 'create').mockReturnValueOnce({
        ...mockIssueOpen,
        id: '1',
      } as IssueOpen);
      await issuesOpenService.createIssueOpen(mockCreateIssueOpendto);
      expect(issuesOpenRepository.save).toHaveBeenCalledWith({
        ...mockIssueOpen,
        id: '1',
      });
    });

    it('should throw an internal server error exception', async () => {
      jest.spyOn(issuesOpenRepository, 'save').mockRejectedValueOnce(new Error());
      expect(issuesOpenService.createIssueOpen(dto)).rejects.toThrowError(
        InternalServerErrorException,
      );
    });
  });

  describe('findIssuesOpen', () => {
    it('should return a list of issuesOpen', async () => {
      const response = await issuesOpenService.findIssuesOpen();

      expect(response).toEqual(usersEntityList);
      expect(issuesOpenRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception', () => {
      jest.spyOn(issuesOpenRepository, 'find').mockResolvedValueOnce(null);

      expect(issuesOpenService.findIssuesOpen()).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('findIssueOpenById', () => {
    const id = mockUuid;

    it('should return an issueOpen entity successfully', async () => {
      const response = await issuesOpenService.findIssueOpenById(id);

      expect(response).toEqual(usersEntityList[0]);
    });

    it('should throw a not found exception', () => {
      jest.spyOn(issuesOpenRepository, 'findOne').mockResolvedValueOnce(null);

      expect(issuesOpenService.findIssueOpenById(id)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('updateIssueOpen', () => {
    const id = mockUuid;
    const dto = mockUpdateIssueOpenDto;

    it('should return an updated issueOpen successfully', async () => {
      const response = await issuesOpenService.updateIssueOpen({ ...dto }, id);
      expect(response).toMatchObject({ ...mockUpdateIssueOpenDto });
    });

    it('should return an internal server error exception when issueOpen cannot be updated', async () => {
      jest.spyOn(issuesOpenRepository, 'save').mockRejectedValue(new Error());

      expect(issuesOpenService.updateIssueOpen({ ...dto }, id)).rejects.toThrowError(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteIssueOpen', () => {
    it('should delete an issueOpen with success', async () => {
      const id = mockUuid;
      await issuesOpenService.deleteIssueOpen(id);
      expect(issuesOpenRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should return a not found exception', () => {
      const id = mockUuid;

      jest
        .spyOn(issuesOpenRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      expect(issuesOpenService.deleteIssueOpen(id)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
