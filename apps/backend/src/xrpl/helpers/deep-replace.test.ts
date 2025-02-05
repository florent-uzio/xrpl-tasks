import { describe, expect, test } from "@jest/globals"
import { AMMCreate, TrustSet } from "xrpl"
import { convertCurrencyCodeToHex, convertHexCurrencyCodeToString } from "./currency-code"
import { deepReplace } from "./deep-replace"

describe("One level object", () => {
  test("it does not change the currency if it has 3 characters", () => {
    const object = {
      name: "Paul",
      currency: "ABC",
    }

    const result = deepReplace(object, "currency", (key, value) => {
      return { [key]: convertCurrencyCodeToHex(value) }
    })

    expect(result).toEqual(object)
  })

  test("it does change the currency if it has more than 3 characters", () => {
    const object = {
      name: "Paul",
      currency: "ABCD",
    }

    const hexCurrency = convertCurrencyCodeToHex(object.currency)

    const result = deepReplace(object, "currency", (key, value) => {
      return { [key]: convertCurrencyCodeToHex(value) }
    })

    expect(result.currency).toEqual(hexCurrency)
    expect(result.name).toEqual(object.name)
  })
})

describe("Nested object", () => {
  test("It changes the currency for a Trustset where currency has more than 3 characters", () => {
    const trustset: TrustSet = {
      Account: "r124",
      TransactionType: "TrustSet",
      LimitAmount: {
        currency: "ABCD",
        value: "100",
        issuer: "r111",
      },
    }

    const result = deepReplace(trustset, "currency", (key, value) => {
      return { [key]: convertCurrencyCodeToHex(value) }
    })

    const expected = {
      ...trustset,
      LimitAmount: {
        ...trustset.LimitAmount,
        currency: convertCurrencyCodeToHex(trustset.LimitAmount.currency),
      },
    }

    expect(result).toEqual(expected)
  })

  test("It changes the currency for an AMMCreate where currency has more than 3 characters", () => {
    const ammCreate: AMMCreate = {
      Account: "r124",
      TransactionType: "AMMCreate",
      Amount: {
        currency: "ABCD",
        issuer: "r123",
        value: "100",
      },
      Amount2: {
        currency: "ZXCV",
        issuer: "r987",
        value: "1000",
      },
      TradingFee: 0,
    }

    const result = deepReplace(ammCreate, "currency", (key, value) => {
      return { [key]: convertCurrencyCodeToHex(value) }
    })

    const expected = {
      ...ammCreate,
      Amount: {
        // @ts-expect-error Will work as Amount is an object and not a string
        ...ammCreate.Amount,
        // @ts-expect-error Will work as Amount is an object and not a string
        currency: convertCurrencyCodeToHex(ammCreate.Amount.currency),
      },
      Amount2: {
        // @ts-expect-error Will work as Amount is an object and not a string
        ...ammCreate.Amount2,
        // @ts-expect-error Will work as Amount is an object and not a string
        currency: convertCurrencyCodeToHex(ammCreate.Amount2.currency),
      },
    }

    expect(result).toEqual(expected)
  })

  test("It changes the currency in an array of string", () => {
    const initial = {
      result: {
        account: "raqrq7tBDuHASDAm1P1f1DBDt3EMxiLa74",
        ledger_hash: "FE3BB0C3D68704B9D6A41453E6BEF7B4D66D98884436A7BD9C43D75543B2969B",
        ledger_index: 1398802,
        validated: true,
        limit: 200,
        lines: [
          {
            account: "r9utQqou1gGDpP8d9UyEdTH5G6Ta5e7YPB",
            balance: "100",
            currency: "4C4F4E444F4E5F44454D4F000000000000000000",
            limit: "1000000",
            limit_peer: "0",
            quality_in: 0,
            quality_out: 0,
            no_ripple: false,
            no_ripple_peer: false,
          },
          {
            account: "r9utQqou1gGDpP8d9UyEdTH5G6Ta5e7YPC",
            balance: "110",
            currency: "4C4F4E444F4E5F44454D4F000000000000000000",
            limit: "1000000",
            limit_peer: "0",
            quality_in: 0,
            quality_out: 0,
            no_ripple: false,
            no_ripple_peer: false,
          },
          {
            receive_currencies: [
              "4C4F4E444F4E5F44454D4F000000000000000000",
              "4C4F4E444F4E5F44454D4F000000000000000000",
            ],
            send_currencies: "4C4F4E444F4E5F44454D4F000000000000000000",
          },
        ],
      },
      id: 1,
      type: "response",
      warnings: [
        {
          id: 2001,
          message:
            "This is a clio server. clio only serves validated data. If you want to talk to rippled, include 'ledger_index':'current' in your request",
        },
      ],
    }

    const result = deepReplace(initial, "receive_currencies", (key, value) => {
      if (Array.isArray(value)) {
        const newValues = value.map((val) => convertHexCurrencyCodeToString(val))
        return { [key]: newValues }
      }
      return { [key]: convertCurrencyCodeToHex(value) }
    })

    const EXPECTED_STRING = "LONDON_DEMO"

    expect(result.result.lines[2].receive_currencies[0]).toBe(EXPECTED_STRING)
    expect(result.result.lines[2].receive_currencies[1]).toBe(EXPECTED_STRING)
  })
})
