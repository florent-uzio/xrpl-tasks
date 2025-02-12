import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common"
import { ListrTask } from "listr2"
import { isUndefined } from "../../helpers"
import { TaskEmitterService } from "../../task-emitter"
import { TokenIssuanceDto } from "../dto"
import { TokenIssuanceContext, TokenIssuanceTasksTitles } from "../token-issuance.types"

type CreateWalletsProps = Pick<
  TokenIssuanceDto,
  "holderAccountCount" | "operationalAccountCount" | "fundingOptions"
>

/**
 * Create the tasks to create wallets
 */
@Injectable() // Marking this file as Injectable
export class CreateWalletsService {
  private readonly logger = new Logger(CreateWalletsService.name)

  constructor(private readonly taskEmitter: TaskEmitterService) {}

  /**
   * Create the tasks to create wallets
   */
  getTasks({
    operationalAccountCount,
    holderAccountCount,
    fundingOptions,
  }: CreateWalletsProps): ListrTask<TokenIssuanceContext>[] {
    return [
      {
        title: TokenIssuanceTasksTitles.SetupIssuerAccount,
        task: async (ctx, task) => {
          this.taskEmitter.emitTaskUpdate(task.title, "started")
          this.logger.log(`🚀 Creating issuer wallet...`)
          try {
            await ctx.client.fundWallet(ctx.issuer, fundingOptions)
            this.logger.log("✅ Issuer wallet created successfully")
            this.taskEmitter.emitTaskUpdate(task.title, "completed")
          } catch (error) {
            this.logger.error(`❌ Error creating issuer wallet: ${error.message}`)
            this.taskEmitter.emitTaskUpdate(task.title, "failed")
            throw new InternalServerErrorException(error)
          }
        },
      },
      {
        title: TokenIssuanceTasksTitles.SetupOperationalAccounts,
        enabled: () => !isUndefined(operationalAccountCount) && operationalAccountCount > 0,
        task: async (ctx, task) => {
          this.taskEmitter.emitTaskUpdate(task.title, "started")
          this.logger.log(`🚀 Creating ${operationalAccountCount} operational accounts...`)
          try {
            const operationalAccounts = Array.from(
              { length: operationalAccountCount ?? 0 },
              async () => {
                const operationalAccount = await ctx.client.fundWallet(null, fundingOptions)
                return operationalAccount.wallet
              },
            )
            ctx.operationalAccounts = await Promise.all(operationalAccounts)

            this.logger.log(
              `✅ Successfully created ${ctx.operationalAccounts.length} operational accounts`,
            )
            this.taskEmitter.emitTaskUpdate(task.title, "completed")
          } catch (error) {
            this.logger.error(`❌ Error creating operational accounts: ${error.message}`)
            this.taskEmitter.emitTaskUpdate(task.title, "failed")
            throw new InternalServerErrorException(error)
          }
        },
      },
      {
        title: TokenIssuanceTasksTitles.SetupHolderAccounts,
        enabled: () => holderAccountCount > 0,
        task: async (ctx) => {
          this.taskEmitter.emitTaskUpdate(TokenIssuanceTasksTitles.SetupHolderAccounts, "started")
          this.logger.log(`🚀 Creating ${holderAccountCount} holder accounts...`)
          try {
            const holderAccounts = Array.from({ length: holderAccountCount ?? 0 }, async () => {
              const account = await ctx.client.fundWallet(null, fundingOptions)
              return account.wallet
            })

            ctx.holderAccounts = await Promise.all(holderAccounts)

            this.logger.log(`✅ Successfully created ${ctx.holderAccounts.length} holder accounts`)
            this.taskEmitter.emitTaskUpdate(
              TokenIssuanceTasksTitles.SetupHolderAccounts,
              "completed",
            )
          } catch (error) {
            this.logger.error(`❌ Error creating holder accounts: ${error.message}`)
            this.taskEmitter.emitTaskUpdate(TokenIssuanceTasksTitles.SetupHolderAccounts, "failed")
            throw new InternalServerErrorException(error)
          }
        },
      },
    ]
  }
}
