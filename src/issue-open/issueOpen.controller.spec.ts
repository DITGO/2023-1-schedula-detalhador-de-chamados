import { Test, TestingModule } from '@nestjs/testing';
import { IssuesOpenController } from './issueOpen.controller';
import { IssuesOpenService } from './issueOpen.service';
import { v4 as uuidv4 } from 'uuid';
import { CacheModule } from '@nestjs/common';
import { CreateIssueOpendto } from './dto/createIssueOpendto';

describe('IssuesOpenController', () => {
  let controller: IssuesOpenController;

  const mockUuid = uuidv4();

  const mockCreateIssueOpendto: CreateIssueOpendto = {
    requester: 'Mockerson',
    phone: '61988554474',
    city_id: '123',
    workstation_id: '123',
    problem_category_id: 'Category Mock',
    problem_types_ids: ['Type Mock'],
    date: new Date(),
    email: 'mockerson@mock.com',
    description: 'description Mock',
    cellphone: '61940028922',
  };

  const mockUpdateissueOpenDto: CreateIssueOpendto = {
    requester: 'Mockerson',
    phone: '61988554474',
    city_id: '123',
    workstation_id: '123',
    problem_category_id: 'Category Mock',
    problem_types_ids: ['Type Mock'],
    date: new Date(),
    email: 'mockerson@mock.com',
    description: 'description Mock',
    cellphone: '61940028922',
  };

  const mockIssuesOpenService = {
    createIssueOpen: jest.fn((dto) => {
      return {
        ...dto,
      };
    }),
    findIssuesOpen: jest.fn(() => {
      return [{ ...mockCreateIssueOpendto }];
    }),
    findIssueOpenById: jest.fn((id) => {
      return {
        id,
        ...mockCreateIssueOpendto,
      };
    }),
    updateIssueOpen: jest.fn((dto, id) => {
      return {
        ...dto,
        id,
      };
    }),
    deleteIssueOpen: jest.fn((id) => {
      return {
        message: 'Agendamento removido com sucesso',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IssuesOpenController],
      providers: [IssuesOpenService],
      imports: [CacheModule.register()],
    })
      .overrideProvider(IssuesOpenService)
      .useValue(mockIssuesOpenService)
      .compile();

    controller = module.get<IssuesOpenController>(IssuesOpenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a issueOpen', async () => {
    const dto = mockCreateIssueOpendto;
    const response = await controller.createIssueOpen(dto);
    expect(response).toMatchObject({ ...dto });
  });

  it('should return all issuesOpen', async () => {
    const response = await controller.getIssuesOpen();
    expect(response.length).toBeGreaterThan(0);
    expect(response).toEqual([{ ...mockCreateIssueOpendto }]);
  });

  it('should return a issueOpen with the respective id', async () => {
    const issueOpenId = mockUuid;
    const response = await controller.getIssueOpen(issueOpenId);
    expect(response).toMatchObject({ id: issueOpenId });
  });

  it('should update a issueOpen', async () => {
    const issueOpenId = mockUuid;
    const dto = mockUpdateissueOpenDto;
    const response = await controller.updateIssueOpen(issueOpenId, dto);
    expect(response).toMatchObject({ id: issueOpenId, ...dto });
  });

  it('should delete a issueOpen', async () => {
    const issueOpenId = mockUuid;
    const successMessage = 'Agendamento removido com sucesso';
    const response = await controller.deleteIssueOpen(issueOpenId);
    expect(response).toMatchObject({ message: successMessage });
  });
});
