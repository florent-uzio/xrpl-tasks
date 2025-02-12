// Map of number to AccountSetAsf name
const accountSetAsfMap: Record<number, string> = {
  1: "asfRequireDest",
  2: "asfRequireAuth",
  3: "asfDisallowXRP",
  4: "asfDisableMaster",
  5: "asfAccountTxnID",
  6: "asfNoFreeze",
  7: "asfGlobalFreeze",
  8: "asfDefaultRipple",
  9: "asfDepositAuth",
  10: "asfAuthorizedNFTokenMinter",
  11: "asfPayChanRecipientDel",
  12: "asfDisallowIncomingNFTokenOffer",
  13: "asfDisallowIncomingCheck",
  14: "asfDisallowIncomingPayChan",
  15: "asfDisallowIncomingTrustline",
  16: "asfAllowTrustLineClawback",
}

// Function to get the AccountSetAsf name from a number
export function getAccountSetAsfName(flagNumber: number): string | undefined {
  return accountSetAsfMap[flagNumber]
}
