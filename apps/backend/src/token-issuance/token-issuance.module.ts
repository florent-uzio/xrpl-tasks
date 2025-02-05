import { Module } from '@nestjs/common';
import { TokenIssuanceService } from './token-issuance.service';
import { TokenIssuanceController } from './token-issuance.controller';

@Module({
  controllers: [TokenIssuanceController],
  providers: [TokenIssuanceService],
})
export class TokenIssuanceModule {}
