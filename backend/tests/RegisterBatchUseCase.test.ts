import { RegisterBatchUseCase } from '../src/modules/inventory/application/usecases/batches/RegisterBatchUseCase';

// Mock audit middleware before importing the use case
jest.mock('../src/shared/middleware/audit.middleware', () => ({
  logAudit: jest.fn().mockResolvedValue(true)
}));

describe('RegisterBatchUseCase', () => {
  let mockRepo: any;
  let useCase: RegisterBatchUseCase;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockImplementation((batch) => Promise.resolve(batch)),
    };
    useCase = new RegisterBatchUseCase(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve registrar o lote como DISPONIVEL se a validade for > 15 dias', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 20);
    
    const result = await useCase.execute({
      productId: 'prod-1',
      batchNumber: 'L001',
      initialQuantity: 100,
      manufactureDate: new Date(),
      expiryDate: futureDate
    }, 'user-1', 'Admin');

    expect(result.status).toBe('DISPONIVEL');
  });

  it('deve registrar o lote como QUARENTENA se a validade for <= 15 dias', async () => {
    const shortDate = new Date();
    shortDate.setDate(shortDate.getDate() + 10);
    
    const result = await useCase.execute({
      productId: 'prod-1',
      batchNumber: 'L002',
      initialQuantity: 100,
      manufactureDate: new Date(),
      expiryDate: shortDate
    }, 'user-1', 'Admin');

    expect(result.status).toBe('QUARENTENA');
  });
});
