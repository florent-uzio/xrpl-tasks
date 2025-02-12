import { AccountSetAsfFlags } from "xrpl"
import { isUndefined } from "../../helpers"
import { TokenIssuanceDto } from "../dto"
import { TokenIssuanceContext } from "../token-issuance.types"

/**
 * Determines whether the issuer can create tickets for account settings.
 * Tickets can only be created if the issuer does not require authorization for trustlines
 * and the number of issuer settings exceeds two.
 *
 * @param issuerSettings - The settings of the issuer account.
 * @returns A boolean indicating whether the issuer can create tickets.
 */
export const canIssuerCreateTicketsForAccountSet = (
  issuerSettings: TokenIssuanceDto["issuerSettings"],
) => {
  return (
    !issuerHasAnyFlags(issuerSettings, [
      AccountSetAsfFlags.asfRequireAuth,
      AccountSetAsfFlags.asfAllowTrustLineClawback,
    ]) && countIssuerSettings(issuerSettings) > 2
  )
}

/**
 * Counts the total number of issuer account settings.
 * Includes `Domain`, `TickSize`, `TransferRate`, and any flags in `setFlags`.
 *
 * @param issuerSettings - The settings of the issuer account.
 * @returns The total count of issuer settings.
 */
export const countIssuerSettings = (issuerSettings: TokenIssuanceDto["issuerSettings"]) => {
  let totalSettings = 0

  const { Domain, TickSize, TransferRate, setFlags } = issuerSettings ?? {}

  if (Domain || TickSize || TransferRate) totalSettings++

  if (!isUndefined(setFlags)) {
    const setFlagsArr = !isUndefined(setFlags) && Array.isArray(setFlags) ? setFlags : [setFlags]
    totalSettings = totalSettings + setFlagsArr.length
  }

  return totalSettings
}

/**
 * Function to check if the there are enough operational and holder accounts to then do a task.
 * @returns A boolean
 */
export const hasEnoughOperationalAndHolders = (
  ctx: TokenIssuanceContext,
  minRequiredAccounts = 3,
) => {
  return ctx.holderAccounts.length + ctx.operationalAccounts.length >= minRequiredAccounts
}

/**
 * Function to check if there are enough operational accounts to then do a task.
 * @returns A boolean
 */
export const hasEnoughOperational = (ctx: TokenIssuanceContext) => {
  return ctx.operationalAccounts.length > 2
}

/**
 * Checks if the initial settings of the issuer account have any of the passed flags.
 * @param issuerSettings
 * @param flags
 * @returns A boolean indicating if the issuer account has any of the passed flags
 */
export const issuerHasAnyFlags = (
  issuerSettings: TokenIssuanceDto["issuerSettings"],
  flags: AccountSetAsfFlags[],
) => {
  return flags.some((flag) => issuerSettings?.setFlags?.includes(flag))
}
