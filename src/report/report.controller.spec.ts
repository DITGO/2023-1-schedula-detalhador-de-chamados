import { Test, TestingModule } from '@nestjs/testing';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

describe('ReportController', () => {
  let controller: ReportController;

  const mockReportService = {
    getReport: jest.fn((startDate, endDate) => {
      return Buffer.from('mock');
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [
        {
          provide: ReportService,
          useValue: mockReportService,
        },
      ],
    }).compile();

    controller = module.get<ReportController>(ReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a buffer', async () => {
    const response = await controller.getReport('2021-01-01', '2021-12-31');
    expect(response).toBeInstanceOf(Buffer);
  });

  it('should call getReport', async () => {
    const spy = jest.spyOn(mockReportService, 'getReport');
    await controller.getReport('2021-01-01', '2021-12-31');
    expect(spy).toHaveBeenCalled();
  });

  it('should call getReport with correct params', async () => {
    const spy = jest.spyOn(mockReportService, 'getReport');
    await controller.getReport('2021-01-01', '2021-12-31');
    expect(spy).toHaveBeenCalledWith('2021-01-01', '2021-12-31');
  });
});
