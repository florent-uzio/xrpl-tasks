import { Body, Controller, Logger, Post, Sse } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { map, Subject } from "rxjs"
import { TOKEN_ISSUANCE_UPDATE_EVENT } from "../constants"
import { TokenIssuanceDto } from "./dto"
import { TokenIssuanceService } from "./token-issuance.service"

type Payload = {
  status: string
  task: string
}

@Controller("token-issuance")
export class TokenIssuanceController {
  private readonly logger = new Logger(TokenIssuanceController.name)

  constructor(private readonly tokenIssuanceService: TokenIssuanceService) {}
  private taskUpdates = new Subject<MessageEvent<Payload>>()

  // 🚀 Start the token issuance process
  @Post()
  async startTokenIssuance(@Body() dto: TokenIssuanceDto) {
    this.tokenIssuanceService.runTokenIssuanceTasks(dto)
    return { message: "Task started. Subscribe to /token-issuance/updates for updates." }
  }

  // 🎯 Subscribe to task updates using SSE
  @Sse("updates")
  getTaskUpdates() {
    return this.taskUpdates.pipe(
      map(({ data }) => {
        return { data }
      }),
    )
  }

  // 🔄 Listen for task updates and send them to SSE subscribers
  @OnEvent(TOKEN_ISSUANCE_UPDATE_EVENT)
  handleTaskUpdate(payload: Payload) {
    const messageEvent = new MessageEvent<Payload>(TOKEN_ISSUANCE_UPDATE_EVENT, { data: payload })
    this.taskUpdates.next(messageEvent)
  }
}
