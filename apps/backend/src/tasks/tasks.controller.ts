import { Body, Controller, Post } from "@nestjs/common"
import { TokenIssuanceDto } from "./dto"
import { TasksService } from "./tasks.service"

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post("token-issuance")
  async runTokenIssuanceTasks(@Body() props: TokenIssuanceDto) {
    const tasks = await this.tasksService.runTokenIssuanceTasks(props)
    const context = await tasks.run()
    return {
      issuer: context.issuer,
      holders: context.holderAccounts,
      operational: context.operationalAccounts,
    }
  }
}
