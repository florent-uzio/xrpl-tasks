import { Module } from "@nestjs/common"
import { XrplModule } from "../xrpl"
import { TokenIssuanceController } from "./token-issuance.controller"
import { TokenIssuanceService } from "./token-issuance.service"

@Module({
  controllers: [TokenIssuanceController],
  providers: [TokenIssuanceService],
  imports: [XrplModule],
})
export class TokenIssuanceModule {}
