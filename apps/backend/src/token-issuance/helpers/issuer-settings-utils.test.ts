import { describe, expect, it } from "@jest/globals"
import { AccountSetAsfFlags } from "xrpl"
import { issuerHasAnyFlags } from "./issuer-settings-utils"

describe("issuer-settings-utils", () => {
  describe("issuerHasAnyFlags", () => {
    it("should return true if any of the passed flags are set", () => {
      const issuerSettings = {
        setFlags: [AccountSetAsfFlags.asfRequireAuth, AccountSetAsfFlags.asfDepositAuth],
      }
      const flags = [AccountSetAsfFlags.asfDepositAuth, AccountSetAsfFlags.asfDefaultRipple]
      expect(issuerHasAnyFlags(issuerSettings, flags)).toBe(true)
    })

    it("should return false if none of the passed flags are set", () => {
      const issuerSettings = {
        setFlags: [AccountSetAsfFlags.asfRequireAuth],
      }
      const flags = [AccountSetAsfFlags.asfDepositAuth, AccountSetAsfFlags.asfDefaultRipple]
      expect(issuerHasAnyFlags(issuerSettings, flags)).toBe(false)
    })

    it("should return false if issuerSettings is an empty object", () => {
      const issuerSettings = {}
      const flags = [AccountSetAsfFlags.asfDepositAuth, AccountSetAsfFlags.asfDefaultRipple]
      expect(issuerHasAnyFlags(issuerSettings, flags)).toBe(false)
    })

    it("should return false if issuerSettings.setFlags is an empty array", () => {
      const issuerSettings = { setFlags: [] }
      const flags = [AccountSetAsfFlags.asfDepositAuth, AccountSetAsfFlags.asfDefaultRipple]
      expect(issuerHasAnyFlags(issuerSettings, flags)).toBe(false)
    })
  })
})
