import { Test, TestingModule } from '@nestjs/testing';
import { TokenIssuanceService } from './token-issuance.service';

describe('TokenIssuanceService', () => {
  let service: TokenIssuanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenIssuanceService],
    }).compile();

    service = module.get<TokenIssuanceService>(TokenIssuanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
