import { Injectable, Logger } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { Listr } from "listr2"
import { Wallet } from "xrpl"
import { XrplService } from "../xrpl"
import { TokenIssuanceDto } from "./dto"
import { TokenIssuanceContext } from "./token-issuance.types"

@Injectable()
export class TokenIssuanceService {
  private readonly logger = new Logger(TokenIssuanceService.name)

  constructor(
    private readonly xrplService: XrplService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async runTokenIssuanceTasks(props: TokenIssuanceDto) {
    this.logger.log("🚀 Starting token issuance tasks...")
    const tasks = new Listr<TokenIssuanceContext>([], {
      concurrent: false,
      // @ts-expect-error - Works fine with silent
      renderer: "silent",
    })

    tasks.add({
      title: "Initializing the context",
      task: async (ctx, task) => {
        this.emitTaskUpdate(task.title, "started")
        this.logTaskStart(task.title)

        ctx.client = this.xrplService.getClient()
        ctx.issuer = Wallet.generate()
        ctx.operationalAccounts = []
        ctx.holderAccounts = []
        ctx.issuerTickets = []

        this.logTaskComplete(task.title)
        this.emitTaskUpdate(task.title, "completed")
      },
    })

    tasks.add({
      title: "Creating wallets",
      task: (_, task) => {
        this.emitTaskUpdate(task.title, "started")
        this.logTaskStart(task.title)

        // const walletsTasks = createWalletsTasks(props)
        const subtasks = task.newListr<TokenIssuanceContext>([], {
          concurrent: true,
        })

        this.logTaskComplete(task.title)
        this.emitTaskUpdate(task.title, "completed")

        return subtasks
      },
    })

    tasks.run()
  }

  private logTaskStart(title: string) {
    this.logger.log(`🚀 Starting: ${title}`)
  }

  private logTaskComplete(title: string) {
    this.logger.log(`✅ Completed: ${title}`)
  }

  private logTaskError(title: string, error: any) {
    this.logger.error(`❌ Failed: ${title}`, error.stack || error.message)
  }

  private emitTaskUpdate(task: string, status: "started" | "completed" | "failed") {
    this.logger.log(`📢 Task Update: ${task} - ${status}`)
    this.eventEmitter.emit("task.update", { task, status })
  }
}
