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

/**
 * Configuration options for issuing tokens.
 */
// export type TokenIssuanceConfig = {
//   /** XRP Ledger network identifier (e.g., "mainnet", "testnet", etc.) */
//   network: string

//   /** Number of operational accounts to create (optional) */
//   operationalAccountCount?: number

//   /** Number of holder accounts to create (optional) */
//   holderAccountCount: number

//   /** Options for funding operational and holder accounts */
//   fundingOptions?: FundingOptions

//   /** Issuer wallet settings, such as flags and transaction parameters */
//   issuerSettings?: {
//     /** Set flags for the issuer wallet */
//     setFlags?: AccountSetAsfFlags[]

//     /** Optional issuer-specific settings */
//   } & Pick<AccountSet, "Domain" | "TickSize" | "TransferRate">

//   /** Parameters for creating trust lines */
//   trustLineParams: Pick<TrustSet, "Flags"> & {
//     /** The currency code for the trust line */
//     currency: IssuedCurrencyAmount["currency"]

//     /** The trust line's maximum value */
//     value: IssuedCurrencyAmount["value"]
//   }

//   /** If disabled, the script will not run */
//   run?: boolean
// }
