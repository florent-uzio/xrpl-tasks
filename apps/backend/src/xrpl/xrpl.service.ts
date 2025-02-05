import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { Client, Request, SubmittableTransaction } from "xrpl"
import { convertCurrencyCodeToHex, deepReplace } from "./helpers"
import { SubmitTxnAndWaitProps } from "./xrpl.services.types"

@Injectable()
export class XrplService implements OnModuleInit {
  private readonly logger = new Logger(XrplService.name)
  private client: Client

  constructor() {
    this.client = new Client("wss://s.devnet.rippletest.net:51233")
  }

  async onModuleInit() {
    this.logger.log("Connecting to XRPL")
    await this.client.connect()
    this.logger.log("Connected to XRPL")
  }

  async onModuleDestroy() {
    this.logger.log("Disconnecting XRPL websocket")
    await this.client.disconnect()
    this.logger.log("XRPL WebSocket disconnected")
  }

  /**
   * Get the XRPL client
   * @returns
   */
  getClient() {
    return this.client
  }

  /**
   * Ensure the XRPL WebSocket connection is active
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  private async ensureConnection() {
    const isConnected = this.client.isConnected()
    this.logger.log(`XRPL WebSocket connected: ${isConnected}`)

    if (!isConnected) {
      try {
        this.logger.error("XRPL WebSocket is not connected, reconnecting")
        await this.client.connect()
        this.logger.log("XRPL WebSocket reconnected")
      } catch (error) {
        this.logger.error("Error reconnecting to XRPL WebSocket", error)
      }
    } else {
      this.logger.log("XRPL WebSocket is connected")
    }
  }

  /**
   * Submit a transaction to the XRPL and wait for the response
   * @param props The transaction properties with the wallet
   * @returns A {@link Promise} of the response
   */
  public async submitTxnAndWait<T extends SubmittableTransaction>(props: SubmitTxnAndWaitProps<T>) {
    if (!this.client.isConnected()) {
      throw new InternalServerErrorException("XRPL WebSocket is not connected")
    }

    if (props.isMultisign) {
      // TODO
      //await multiSignAndSubmit(props.signatures, props.client)
    } else {
      const { wallet, txn, showLogs = true } = props

      if (showLogs) {
        this.logger.log(`Submitting: ${txn.TransactionType}`)
      }

      // Make sure the originating transaction address is the same as the wallet public address
      if (props.txn.Account !== wallet.address) {
        throw new BadRequestException("Field 'Account' must have the same address as the Wallet")
      }

      // Update the currency in case it has more than 3 characters
      const updatedTxn = deepReplace(txn, "currency", (key, value) => {
        return { [key]: convertCurrencyCodeToHex(value) }
      })

      // Submit to the XRPL and wait for the response
      const response = await this.client.submitAndWait(updatedTxn, { autofill: true, wallet })

      return response
    }
  }

  /**
   * Submit a request to the XRPL such as account_info, account_lines, etc.
   * @param req The request to submit
   * @returns The request response
   */
  public async submitMethod(req: Request, showLogs = true) {
    if (!this.client.isConnected()) {
      throw new InternalServerErrorException("XRPL WebSocket is not connected")
    }

    if (showLogs) {
      this.logger.log(`Submitting: ${req.command}`)
    }

    const response = await this.client.request(req)

    return response
  }
}
