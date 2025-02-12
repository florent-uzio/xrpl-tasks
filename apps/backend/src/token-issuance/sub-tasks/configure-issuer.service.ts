import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common"
import { delay, ListrTask } from "listr2"
import { AccountSet, convertStringToHex } from "xrpl"
import { isUndefined, random } from "../../helpers"
import { TaskEmitterService } from "../../task-emitter"
import { XrplService } from "../../xrpl"
import { TokenIssuanceDto } from "../dto"
import { canIssuerCreateTicketsForAccountSet, getAccountSetAsfName } from "../helpers"
import { TokenIssuanceContext } from "../token-issuance.types"

@Injectable()
export class ConfigureIssuerService {
  private readonly logger = new Logger(ConfigureIssuerService.name)

  constructor(
    private readonly taskEmitter: TaskEmitterService,
    private readonly xrplService: XrplService,
  ) {}

  getTasks = (
    issuerSettings: TokenIssuanceDto["issuerSettings"],
  ): ListrTask<TokenIssuanceContext>[] => {
    if (!issuerSettings) {
      return []
    }

    const settings = Object.keys(issuerSettings)
    const settingsToDisplay = settings.filter(
      (setting) => setting !== "setFlags" && setting !== "ClearFlag",
    )

    return [
      {
        title: `Setting ${settingsToDisplay.join(", ")} in AccountSet`,
        enabled: () => this.hasNonFlagIssuerSettings(issuerSettings),
        task: async (ctx, task) => {
          this.taskEmitter.emitTaskUpdate(task.title, "started")
          this.logger.log(`🚀 Setting ${settingsToDisplay.join(", ")} in AccountSet...`)

          const txn: AccountSet = {
            Account: ctx.issuer.address,
            TransactionType: "AccountSet",
            Domain: convertStringToHex(issuerSettings?.Domain ?? ""),
            TickSize: issuerSettings?.TickSize,
            TransferRate: issuerSettings?.TransferRate,
          }

          if (canIssuerCreateTicketsForAccountSet(issuerSettings)) {
            const ticket = ctx.issuerTickets.shift()
            if (!ticket) {
              this.logger.error("❌ No available tickets for setting non flag settings")
              throw new InternalServerErrorException(
                "No available tickets for setting non flag settings",
              )
            }
            txn.TicketSequence = ticket.TicketSequence
            txn.Sequence = 0
          }

          try {
            await this.xrplService.submitTxnAndWait({
              txn,
              wallet: ctx.issuer,
              showLogs: false,
            })
            this.logger.log(`✅ ${settingsToDisplay.join(", ")} set in AccountSet`)
            this.taskEmitter.emitTaskUpdate(task.title, "completed")
          } catch (error) {
            this.logger.error(
              `❌ Error setting ${settingsToDisplay.join(", ")} in AccountSet: ${error.message}`,
            )
            this.taskEmitter.emitTaskUpdate(task.title, "failed")
            throw new InternalServerErrorException(error)
          }
        },
      },

      {
        title: "Setting AccountSet flags",
        enabled: () => !isUndefined(issuerSettings?.setFlags),
        task: async (_, task) => {
          if (!issuerSettings?.setFlags) return

          const subtasks = task.newListr<TokenIssuanceContext>([], { concurrent: false })

          for (const flag of issuerSettings.setFlags) {
            subtasks.add({
              title: `Setting flag: ${getAccountSetAsfName(flag)}`,
              task: async (ctx) => {
                delay(random(1, 4))

                const txn: AccountSet = {
                  Account: ctx.issuer.address,
                  TransactionType: "AccountSet",
                  SetFlag: flag,
                }

                if (canIssuerCreateTicketsForAccountSet(issuerSettings)) {
                  const ticket = ctx.issuerTickets.shift()
                  if (!ticket) {
                    this.logger.error(
                      `❌ No available tickets for setting AccountSet flag: ${getAccountSetAsfName(flag)}`,
                    )
                    throw new InternalServerErrorException(
                      `No available tickets for setting AccountSet flags number: ${getAccountSetAsfName(flag)}`,
                    )
                  }
                  txn.TicketSequence = ticket.TicketSequence
                  txn.Sequence = 0
                }

                try {
                  await this.xrplService.submitTxnAndWait({
                    txn,
                    wallet: ctx.issuer,
                    showLogs: false,
                  })
                } catch (error) {
                  this.logger.error(
                    `❌ Error setting AccountSet flag: ${getAccountSetAsfName(flag)}: ${error.message}`,
                  )
                  throw new InternalServerErrorException(error)
                }
              },
            })
          }

          return subtasks
        },
      },
    ]
  }

  /**
   * Check if there are any non-flag issuer settings
   * @param issuerSettings
   * @returns A boolean indicating if there are any non-flag issuer settings
   */
  hasNonFlagIssuerSettings = (issuerSettings: TokenIssuanceDto["issuerSettings"]) => {
    const { Domain, TickSize, TransferRate } = issuerSettings ?? {}

    return !isUndefined(Domain) || !isUndefined(TickSize) || !isUndefined(TransferRate)
  }
}
