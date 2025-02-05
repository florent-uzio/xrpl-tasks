import { Injectable, Logger } from "@nestjs/common"
import { Listr } from "listr2"
import { Wallet } from "xrpl"
import { XrplService } from "../xrpl"
import { TokenIssuanceDto } from "./dto"
import { TokenIssuanceContext } from "./models"
import { createWalletsTasks } from "./sub-tasks"

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)

  constructor(private readonly xrplService: XrplService) {}

  async runTokenIssuanceTasks(props: TokenIssuanceDto) {
    const tasks = new Listr<TokenIssuanceContext>([], {
      concurrent: false,
      // @ts-expect-error - Works fine with silent
      renderer: "silent",
    })

    tasks.add({
      title: "Initializing the context",
      task: async (ctx, task) => {
        this.logTaskStart(task.title)
        ctx.client = this.xrplService.getClient()
        ctx.issuer = Wallet.generate()
        ctx.operationalAccounts = []
        ctx.holderAccounts = []
        ctx.issuerTickets = []
        this.logTaskComplete(task.title)
      },
    })

    tasks.add({
      title: "Creating wallets",
      task: (ctx, task) => {
        this.logTaskStart(task.title)

        const walletsTasks = createWalletsTasks(ctx, props)
        const subtasks = task.newListr<TokenIssuanceContext>(walletsTasks, {
          concurrent: true,
        })

        this.logTaskComplete(task.title)

        return subtasks
      },
    })

    return tasks
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
}
