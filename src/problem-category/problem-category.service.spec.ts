import { Test, TestingModule } from '@nestjs/testing';
import { ProblemCategoryService } from './problem-category.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProblemCategory } from './entities/problem-category.entity';
import { ProblemTypesService } from '../problem-types/problem-types.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';

describe('ProblemCategoryService', () => {
    let service: ProblemCategoryService;
    let repo: Repository<ProblemCategory>;
    
    const mockUuid = uuid();
    
    const mockProblemType = {
        name: 'mockProblemType',
        visible_user_external: false,
        description: 'mockDescription',
    };
    
    const mockProblemCategory = {
        name: 'mockProblemCategory',
        visible_user_external: false,
        desciption: 'mockDescription',
        problem_types: [mockProblemType],
    };
    
    const mockIssuesIdsList: string[] = ['0'];

    const mockCreateProblemCategoryDto = {
        name: 'mockProblemCategory',
        visible_user_external: false,
        description: 'mockDescription',
        problem_types_ids: ['123'],
    };

    const mockUpdateProblemCategoryDto = {
        name: 'mockProblemCategory',
        visible_user_external: false,
        description: 'mockDescription',
        problem_types_ids: ['123'],
    };

    const mockProblemTypesService = {
        findProblemTypes: jest.fn().mockResolvedValue([{ ...mockProblemType }]),
        findProblemType: jest.fn().mockResolvedValue(mockProblemType),
        createProblemType: jest.fn().mockResolvedValue(mockProblemType),
        updateProblemType: jest.fn().mockResolvedValue(mockProblemType),
        deleteProblemType: jest.fn(),
    };

    const mockProblemCategoryEntityList = [{ ...mockCreateProblemCategoryDto }];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProblemCategoryService,
                {
                    provide: getRepositoryToken(ProblemCategory),
                    useValue: {
                        find: jest.fn().mockResolvedValue(mockProblemCategoryEntityList),
                        findOne: jest.fn().mockResolvedValue(mockProblemCategoryEntityList),
                        findOneBy: jest.fn().mockResolvedValue(mockProblemCategory),
                        create: jest.fn().mockReturnValue(mockProblemCategory),
                        save: jest.fn().mockReturnValue(mockProblemCategory),
                        update: jest.fn().mockResolvedValue(mockProblemCategory),
                        delete: jest.fn(),
                        softRemove: jest.fn(),
                    },
                },
                {
                    provide: ProblemTypesService,
                    useValue: mockProblemTypesService,
                },
            ],
        }).compile();

        service = module.get<ProblemCategoryService>(ProblemCategoryService);
        repo = module.get<Repository<ProblemCategory>>(getRepositoryToken(ProblemCategory));
    });

    it('should throw an internal server error exception', async () => {
      jest.spyOn(repo, 'save').mockRejectedValueOnce(new Error());
      expect(
        service.createProblemCategory(mockCreateProblemCategoryDto),
      ).rejects.toThrowError(
        new InternalServerErrorException(
          'Erro ao salvar a categoria no banco de dados',
        ),
      );
    });
  });

  describe('findProblemCategories', () => {
    it('should return all problem categories', async () => {
      const problem_categories = await service.findProblemCategories();
      expect(problem_categories).toEqual(mockProblemCategoryEntityList);
    });
  });

  describe('findProblemCategoryById', () => {
    it('should return a problem category by id', async () => {
      const problem_category = await service.findProblemCategoryById(mockUuid);
      expect(problem_category).toEqual(mockProblemCategoryEntityList);
    });

    it('should throw an internal server error exception', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      expect(service.findProblemCategoryById(mockUuid)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('updateProblemCategory', () => {
    it('should update a problem category successfully', async () => {
      const response = await service.updateProblemCategory(
        mockUuid,
        mockUpdateProblemCategoryDto,
      );
      expect(response).toEqual(mockProblemCategory);
    });

    it('should throw an internal server error exception', async () => {
      jest.spyOn(repo, 'save').mockRejectedValueOnce(new Error());
      expect(
        service.updateProblemCategory(mockUuid, mockUpdateProblemCategoryDto),
      ).rejects.toThrowError(new InternalServerErrorException());
    });
  });

  describe('deleteProblemCategory', () => {
    it('should delete a problem category successfully', async () => {
      await service.deleteProblemCategory(mockUuid);
      expect(repo.softRemove).toHaveBeenCalledTimes(1);
    });

    it('should throw an internal server error exception', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      expect(service.deleteProblemCategory(mockUuid)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
