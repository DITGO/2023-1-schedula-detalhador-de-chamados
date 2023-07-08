import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';

describe('ReportService', () => {
  let service: ReportService;

  const mockReportService = {
    getReport: jest.fn((startDate, endDate) => {
      return Buffer.from('mock');
    }
  )};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ReportService,
          useValue: mockReportService,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
      expect(service).toBeDefined();
    }
  );

  it('should return a buffer', async () => {
    const response = await service.getReport('2021-01-01', '2021-12-31');
    expect(response).toBeInstanceOf(Buffer);
  }
  );

  it('should call getReport', async () => {
    const spy = jest.spyOn(mockReportService, 'getReport');
    await service.getReport('2021-01-01', '2021-12-31');
    expect(spy).toHaveBeenCalled();
  }
  );

  it('should call getReport with correct params', async () => {
    const spy = jest.spyOn(mockReportService, 'getReport');
    await service.getReport('2021-01-01', '2021-12-31');
    expect(spy).toHaveBeenCalledWith('2021-01-01', '2021-12-31');
  }
  );

});
