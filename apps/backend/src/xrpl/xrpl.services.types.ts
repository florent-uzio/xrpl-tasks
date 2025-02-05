import {
  DIDSet,
  EscrowCreate,
  NFTokenCreateOffer,
  NFTokenCreateOfferFlags,
  SubmittableTransaction,
  Wallet,
} from "xrpl"

export type SubmitTxnAndWaitProps<T extends SubmittableTransaction> =
  | TransactionPropsForMultiSign
  | TransactionPropsForSingleSign<T>

export type TxnCommons = { showLogs?: boolean } & (
  | { isMultisign?: true; signatures: string[] }
  | { isMultisign?: false; signatures?: never }
)

export type TransactionPropsForMultiSign = TxnCommons & {
  isMultisign: true
}

export type TransactionPropsForSingleSign<T extends SubmittableTransaction> = TxnCommons & {
  isMultisign?: false
  txn: T extends NFTokenCreateOffer
    ? T &
        (
          | { Flags: NFTokenCreateOfferFlags.tfSellNFToken; Owner?: never }
          | { Flags?: undefined; Owner: string }
        )
    : T extends EscrowCreate
      ? T &
          (
            | ({ CancelAfter: number } & (
                | { FinishAfter: number; Condition?: string }
                | { FinishAfter?: number; Condition: string }
              ))
            | ({ FinishAfter: number } & (
                | { CancelAfter: number; Condition?: string }
                | { CancelAfter?: number; Condition: string }
              ))
          )
      : T extends DIDSet
        ? T &
            // One of the three props below must be present in a DIDSet
            (| { Data: string; DIDDocument?: string; URI?: string }
              | { Data?: string; DIDDocument: string; URI?: string }
              | { Data?: string; DIDDocument?: string; URI: string }
            )
        : T
  wallet: Wallet
}
