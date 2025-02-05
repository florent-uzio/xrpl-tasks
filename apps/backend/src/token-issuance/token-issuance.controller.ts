import { Controller } from '@nestjs/common';
import { TokenIssuanceService } from './token-issuance.service';

@Controller('token-issuance')
export class TokenIssuanceController {
  constructor(private readonly tokenIssuanceService: TokenIssuanceService) {}
}
