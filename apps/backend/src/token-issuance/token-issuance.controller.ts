import { Body, Controller, Post } from "@nestjs/common"
import { TokenIssuanceDto } from "./dto"
import { TokenIssuanceService } from "./token-issuance.service"

@Controller("token-issuance")
export class TokenIssuanceController {
  constructor(private readonly tokenIssuanceService: TokenIssuanceService) {}

  @Post("token-issuance")
  async runTokenIssuanceTasks(@Body() props: TokenIssuanceDto) {
    const tasks = await this.tokenIssuanceService.runTokenIssuanceTasks(props)
    const context = await tasks.run()
    return {
      issuer: context.issuer,
      holders: context.holderAccounts,
      operational: context.operationalAccounts,
    }
  }
}
