import {
  AccountSet,
  AccountSetAsfFlags,
  FundingOptions,
  IssuedCurrencyAmount,
  TrustSet,
} from "xrpl"

export class TokenIssuanceDto {
  /** XRP Ledger network identifier (e.g., "mainnet", "testnet", etc.) */
  network: string

  /** Number of operational accounts to create (optional) */
  operationalAccountCount?: number

  /** Number of holder accounts to create (optional) */
  holderAccountCount: number

  /** Options for funding operational and holder accounts */
  fundingOptions?: FundingOptions

  /** Issuer wallet settings, such as flags and transaction parameters */
  issuerSettings?: {
    /** Set flags for the issuer wallet */
    setFlags?: AccountSetAsfFlags[]

    /** Optional issuer-specific settings */
  } & Pick<AccountSet, "Domain" | "TickSize" | "TransferRate">

  /** Parameters for creating trust lines */
  trustLineParams: Pick<TrustSet, "Flags"> & {
    /** The currency code for the trust line */
    currency: IssuedCurrencyAmount["currency"]

    /** The trust line's maximum value */
    value: IssuedCurrencyAmount["value"]
  }
}
