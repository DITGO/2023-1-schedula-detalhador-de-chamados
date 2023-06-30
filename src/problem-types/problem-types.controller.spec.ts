import { Test, TestingModule } from '@nestjs/testing';
import { ProblemTypesController } from './problem-types.controller';
import { ProblemTypesService } from './problem-types.service';
import { v4 as uuid } from 'uuid';
import { CreateProblemTypeDto } from './dto/createProblem-type.dto';
import { UpdateProblemTypeDto } from './dto/updateProblem-type.dto';
import { CacheModule } from '@nestjs/common';
import { identity } from 'rxjs';

describe('ProblemTypesController', () => {
  let controller: ProblemTypesController;

  const mockUuid = uuid();

  const mockProblemType = {
    name: 'mock',
  };

  const mockCreateProblemTypeDto: CreateProblemTypeDto = {
    name: 'mockProblemType',
    problem_category_id: '123',
    visible_user_external: false,
    issues_ids: ['456', '789'],
  };

  const mockUpdateProblemTypeDto: UpdateProblemTypeDto = {
    name: 'mockProblemType',
    problem_category_id: '123',
    visible_user_external: false,
    issues_ids: ['456', '789'],
  };
  const mockProblemTypesService = {
    findAll: jest.fn(() => {
      return [{ ...mockCreateProblemTypeDto }];
    }),
    findProblemType: jest.fn((id) => {
      return {
        id,
        ...mockCreateProblemTypeDto,
      };
    }),
    createProblemType: jest.fn((dto) => {
      return {
        ...dto,
      };
    }),
    updateProblemType: jest.fn((dto, id) => {
      return mockUpdateProblemTypeDto;
    }),
    deleteProblemType: jest.fn((id) => {
      return {
        message: 'Deletado com sucesso',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProblemTypesController],
      providers: [ProblemTypesService],
      imports: [CacheModule.register()],
    })
      .overrideProvider(ProblemTypesService)
      .useValue(mockProblemTypesService)
      .compile();

    controller = module.get<ProblemTypesController>(ProblemTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get', () => {
    it('should return all problem types', async () => {
      const response = await controller.findAll();
      expect(response.length).toBeGreaterThan(0);
      expect(response).toEqual([{ ...mockCreateProblemTypeDto }]);
    });

    it('should return a problem type with the respective id', async () => {
      const id = mockUuid;
      const response = await controller.findProblemType(id);
      expect(response).toMatchObject({ id: id });
    });
  });

  describe('Post', () => {
    it('should create a problem type successfully', async () => {
      const response = await controller.createProblemType(
        mockCreateProblemTypeDto,
      );
      expect(response).toMatchObject({ ...mockCreateProblemTypeDto });
    });
  });

  describe('Put', () => {
    it('should update a problem type successfully', async () => {
      const id = mockUuid;
      const response = await controller.updateProblemType(
        mockUpdateProblemTypeDto,
        id,
      );
      expect(response).toEqual(mockUpdateProblemTypeDto);
    });
  });

  describe('Delete', () => {
    it('should delete a problem type successfully', async () => {
      const message = 'Deletado com sucesso';
      const id = mockUuid;
      const response = await controller.deleteProblemType(id);
      expect(response).toMatchObject({ message: message });
    });
  });
});
