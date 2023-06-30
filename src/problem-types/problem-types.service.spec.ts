import { Test, TestingModule } from '@nestjs/testing';
import { ProblemTypesService } from './problem-types.service';
import { ProblemType } from './entities/problem-type.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProblemCategoryService } from '../problem-category/problem-category.service';
import { IssuesService } from '../issue/issue.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('ProblemTypesService', () => {
  let service: ProblemTypesService;
  let repo: Repository<ProblemType>;

  const mockUuid = uuid();
  const date = new Date('2022-12-17T17:55:20.565');

  const mockProblemType = {
    name: 'mockProblemType',
  };

  const mockProblemCategory = {
    name: 'mockProblemCategory',
    desciption: 'mockDescription',
  };

  const mockIssue = {
    id: '25',
    requester: 'mockerson',
    phone: '61983445521',
    city_id: 'Brasilia',
    workstation_id: '456',
    problem_category: mockProblemCategory,
    problem_types: [mockProblemType],
    email: 'mockerson@mock.com',
    date: date,
  };

  const mockIssuesIdsList: string[] = ['0'];

  const mockCreateProblemTypeDto = {
    name: 'mockProblemType',
    visible_user_external: false,
    problem_category_id: '123',
    issues_ids: ['456', '789'],
  };

  const mockUpdateProblemTypeDto = {
    name: 'mockProblemType',
    visible_user_external: false,
    problem_category_id: '123',
    issues_ids: ['456', '789'],
  };

  const mockProblemCategoryService = {
    findProblemCategories: jest
      .fn()
      .mockResolvedValue([{ ...mockProblemCategory }]),
    findProblemCategoryById: jest.fn().mockResolvedValue(mockProblemCategory),
    createProblemCategory: jest.fn().mockResolvedValue(mockProblemCategory),
    updateProblemCategory: jest.fn().mockResolvedValue(mockProblemCategory),
    deleteProblemCategory: jest.fn(),
  };

  const mockIssuesService = {
    findIssues: jest.fn().mockResolvedValue([{ ...mockIssue }]),
    findIssueById: jest.fn().mockResolvedValue(mockIssue),
    createIssue: jest.fn().mockResolvedValue(mockIssue),
    updateIssue: jest.fn().mockResolvedValue(mockIssue),
    deleteProblemType: jest.fn(),
  };

  const mockProblemTypeRepository = {
    create: jest.fn().mockResolvedValue(new ProblemType()),
    find: jest.fn().mockResolvedValue([mockProblemType]),
    findOne: jest.fn().mockResolvedValue(mockProblemType),
    findOneBy: jest.fn().mockResolvedValue(mockProblemType),
    delete: jest.fn().mockResolvedValue('Deletado com sucesso'),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemTypesService,
        {
          provide: getRepositoryToken(ProblemType),
          useValue: mockProblemTypeRepository,
        },
        {
          provide: ProblemCategoryService,
          useValue: mockProblemCategoryService,
        },
        {
          provide: IssuesService,
          useValue: mockIssuesService,
        },
      ],
    }).compile();

    service = module.get<ProblemTypesService>(ProblemTypesService);
    repo = module.get<Repository<ProblemType>>(getRepositoryToken(ProblemType));
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createProblemType', () => {
    it('should return a new problem type successfully', async () => {
      await service.createProblemType(mockCreateProblemTypeDto);
      expect(repo.create);
    });

    it('should throw an internal server error exception', async () => {
      jest.spyOn(repo, 'save').mockRejectedValueOnce(new Error());
      expect(
        service.createProblemType(mockCreateProblemTypeDto),
      ).rejects.toThrowError(new InternalServerErrorException());
    });
  });

  describe('findAll', () => {
    it('should return an array of problem types successfully', async () => {
      const response = await service.findAll();
      expect(response).toEqual([mockProblemType]);
      expect(repo.find).toHaveBeenCalledTimes(1);
    });

    it('should throw an internal server error exception', async () => {
      jest.spyOn(repo, 'find').mockRejectedValueOnce(new Error());
      expect(service.findAll()).rejects.toThrowError(
        new InternalServerErrorException(),
      );
    });
  });

  describe('findProblemType', () => {
    const id = mockUuid;
    it('should return a problem type successfully', async () => {
      const response = await service.findProblemType(id);
      expect(response).toEqual(mockProblemType);
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
    });

    it('should throw an internal server error exception', async () => {
      jest.spyOn(repo, 'findOneBy').mockRejectedValueOnce(new Error());
      expect(service.findProblemType(id)).rejects.toThrowError(
        new InternalServerErrorException(),
      );
    });
  });

  describe('updateProblemType', () => {
    const id = mockUuid;
    it('should update a problem type successfully', async () => {
      const response = await service.updateProblemType(
        id,
        mockUpdateProblemTypeDto,
      );
      expect(response).toMatchObject(mockProblemType);
    });

    it('should throw an internal server error exception', async () => {
      jest.spyOn(repo, 'save').mockRejectedValueOnce(new Error());
      expect(
        service.updateProblemType(id, mockUpdateProblemTypeDto),
      ).rejects.toThrowError(new InternalServerErrorException());
    });
  });

  describe('deleteProblemType', () => {
    const id = mockUuid;
    it('should delete a problem type successfully', async () => {
      const result = await service.deleteProblemType(id);
      expect(repo.delete).toHaveBeenCalledTimes(1);
      expect(result).toMatch('Deletado com sucesso');
    });
    it('should throw a internal server error', async () => {
      jest.spyOn(repo, 'delete').mockRejectedValueOnce(new Error());

      expect(service.deleteProblemType(id)).rejects.toThrowError(
        InternalServerErrorException,
      );
    });
  });

  describe('updateIssues', () => {
    it('should update all issues related to the problem type successfully', async () => {
      const result = service.UpdateIssues(mockIssuesIdsList);
      expect(result).toMatchObject({});
    });
  });
});
