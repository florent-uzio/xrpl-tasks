import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { Client } from "xrpl"

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
}
