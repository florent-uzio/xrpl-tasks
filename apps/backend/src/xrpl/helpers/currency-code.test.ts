import { describe, expect, test } from "@jest/globals"
import { convertHexCurrencyCodeToString } from "./currency-code"

describe("hexToString", () => {
  test("it converts correctly an XRPL hex currency to string", () => {
    const currencyHex = "4C4F4E444F4E5F44454D4F000000000000000000"

    const result = convertHexCurrencyCodeToString(currencyHex)

    expect(result).toBe("LONDON_DEMO")
  })

  test("it does not touch a currency which does not have a 40 characters length", () => {
    const currencyHex = "4C4F4E444F4E5F44454D4F0000000000000000"

    const result = convertHexCurrencyCodeToString(currencyHex)

    expect(result).toBe(currencyHex)
  })
})
