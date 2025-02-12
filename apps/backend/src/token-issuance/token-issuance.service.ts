import { Injectable, Logger } from "@nestjs/common"
import { Listr } from "listr2"
import { Wallet } from "xrpl"
import { Ticket } from "xrpl/dist/npm/models/ledger"
import { TaskEmitterService } from "../task-emitter"
import { XrplService } from "../xrpl"
import { TokenIssuanceDto } from "./dto"
import { canIssuerCreateTicketsForAccountSet, countIssuerSettings } from "./helpers"
import { ConfigureIssuerService, CreateWalletsService } from "./sub-tasks"
import { TokenIssuanceContext, TokenIssuanceTasksTitles } from "./token-issuance.types"

@Injectable()
export class TokenIssuanceService {
  private readonly logger = new Logger(TokenIssuanceService.name)

  constructor(
    private readonly xrplService: XrplService,
    private readonly taskEmitter: TaskEmitterService,
    private readonly createWalletsService: CreateWalletsService,
    private readonly configureIssuerService: ConfigureIssuerService,
  ) {}

  async runTokenIssuanceTasks(props: TokenIssuanceDto) {
    this.logger.log("🚀 Starting token issuance tasks...")
    const tasks = new Listr<TokenIssuanceContext>([], {
      concurrent: false,
      // @ts-expect-error - Works fine with silent
      renderer: "silent",
    })

    tasks.add({
      title: TokenIssuanceTasksTitles.InitializeContext,
      task: async (ctx, task) => {
        this.taskEmitter.emitTaskUpdate(task.title, "started")
        this.logTaskStart(task.title)

        ctx.client = this.xrplService.getClient()
        ctx.issuer = Wallet.generate()
        ctx.operationalAccounts = []
        ctx.holderAccounts = []
        ctx.issuerTickets = []

        this.logTaskComplete(task.title)
        this.taskEmitter.emitTaskUpdate(task.title, "completed")
      },
    })

    tasks.add({
      title: TokenIssuanceTasksTitles.GenerateWallets,
      task: async (_, task) => {
        const walletsTasks = this.createWalletsService.getTasks(props)
        const subtasks = task.newListr<TokenIssuanceContext>(walletsTasks, {
          concurrent: true,
        })

        return subtasks
      },
    })

    tasks.add({
      title: "Creating tickets for the issuer settings",
      enabled: canIssuerCreateTicketsForAccountSet(props.issuerSettings),
      task: async (ctx, _) => {
        const numOfTicketsToCreate = countIssuerSettings(props.issuerSettings)

        if (numOfTicketsToCreate === 0) return

        await this.xrplService.submitTxnAndWait({
          txn: {
            Account: ctx.issuer.address,
            TransactionType: "TicketCreate",
            TicketCount: numOfTicketsToCreate,
          },
          wallet: ctx.issuer,
          showLogs: false,
        })

        // Retrieve the ticket objects
        const tickets = await this.xrplService.submitMethod(
          {
            command: "account_objects",
            type: "ticket",
            account: ctx.issuer.address,
          },
          false,
        )

        ctx.issuerTickets = tickets.result.account_objects as Ticket[]
      },
    })

    tasks.add({
      title: "Configuring the issuer",
      task: (_, task) => {
        const issuerTasks = this.configureIssuerService.getTasks(props.issuerSettings)

        const subtasks = task.newListr<TokenIssuanceContext>(issuerTasks, {
          concurrent: canIssuerCreateTicketsForAccountSet(props.issuerSettings),
          rendererOptions: { collapseSubtasks: false },
        })

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
}
