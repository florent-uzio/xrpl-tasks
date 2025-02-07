import { InternalServerErrorException, Logger } from "@nestjs/common"
import { ListrTask } from "listr2"
import { isUndefined } from "../../helpers"
import { TokenIssuanceDto } from "../dto"
import { TokenIssuanceContext } from "../token-issuance.types"

type CreateWalletsProps = Pick<
  TokenIssuanceDto,
  "holderAccountCount" | "operationalAccountCount" | "fundingOptions"
>

const logger = new Logger("WalletTasks")

/**
 * Create the tasks to create wallets
 */
export const createWalletsTasks = ({
  operationalAccountCount,
  holderAccountCount,
  fundingOptions,
}: CreateWalletsProps): ListrTask<TokenIssuanceContext>[] => {
  return [
    {
      title: "Creating issuer",
      task: async (ctx) => {
        logger.log(`🚀 Creating issuer wallet...`)
        try {
          await ctx.client.fundWallet(ctx.issuer, fundingOptions)
          logger.log("✅ Issuer wallet created successfully")
        } catch (error) {
          logger.error(`❌ Error creating issuer wallet: ${error.message}`)
          throw new InternalServerErrorException(error)
        }
      },
    },
    {
      title: "Creating operational account(s)",
      enabled: () => !isUndefined(operationalAccountCount) && operationalAccountCount > 0,
      task: async (ctx) => {
        logger.log(`🚀 Creating ${operationalAccountCount} operational accounts...`)
        try {
          const operationalAccounts = Array.from(
            { length: operationalAccountCount ?? 0 },
            async () => {
              const operationalAccount = await ctx.client.fundWallet(null, fundingOptions)
              return operationalAccount.wallet
            },
          )
          ctx.operationalAccounts = await Promise.all(operationalAccounts)

          logger.log(
            `✅ Successfully created ${ctx.operationalAccounts.length} operational accounts`,
          )
        } catch (error) {
          logger.error(`❌ Error creating operational accounts: ${error.message}`)
          throw new InternalServerErrorException(error)
        }
      },
      retry: 1,
    },
    {
      title: "Creating holder account(s)",
      enabled: () => holderAccountCount > 0,
      task: async (ctx) => {
        logger.log(`🚀 Creating ${holderAccountCount} holder accounts...`)
        try {
          const holderAccounts = Array.from({ length: holderAccountCount ?? 0 }, async () => {
            const account = await ctx.client.fundWallet(null, fundingOptions)
            return account.wallet
          })

          ctx.holderAccounts = await Promise.all(holderAccounts)
        } catch (error) {
          logger.error(`❌ Error creating holder accounts: ${error.message}`)
          throw new InternalServerErrorException(error)
        }
      },
      retry: 1,
    },
  ]
}
