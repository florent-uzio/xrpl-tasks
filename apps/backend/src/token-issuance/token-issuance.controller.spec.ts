import { Test, TestingModule } from '@nestjs/testing';
import { TokenIssuanceController } from './token-issuance.controller';
import { TokenIssuanceService } from './token-issuance.service';

describe('TokenIssuanceController', () => {
  let controller: TokenIssuanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenIssuanceController],
      providers: [TokenIssuanceService],
    }).compile();

    controller = module.get<TokenIssuanceController>(TokenIssuanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
