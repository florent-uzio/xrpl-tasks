import { Client, Wallet } from "xrpl"
import { Ticket } from "xrpl/dist/npm/models/ledger"

/**
 * Represents the context required for issuing tokens.
 */
export type TokenIssuanceContext = {
  /** XRP Ledger client instance for network interactions */
  client: Client

  /** The wallet responsible for issuing tokens */
  issuer: Wallet

  /** Operational wallets to assist in the token issuance process */
  operationalAccounts: Wallet[]

  /** Wallets that will hold the issued tokens */
  holderAccounts: Wallet[]

  /** Pre-created tickets for the issuer (to manage transactions) */
  issuerTickets: Ticket[]
}

export enum TokenIssuanceTasksTitles {
  InitializeContext = "Initialize the context",
  GenerateWallets = "Generate wallets",
  SetupIssuerAccount = "Setup issuer account",
  SetupOperationalAccounts = "Setup operational account(s)",
  SetupHolderAccounts = "Setup holder account(s)",
  MintTokens = "Mint tokens",
  AllocateTokens = "Allocate tokens",
}
