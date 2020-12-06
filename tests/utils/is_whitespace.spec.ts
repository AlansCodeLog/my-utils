import { expect } from "@tests/chai"

import { test_name } from "@/testing"
import { is_whitespace } from "@/utils"


describe(test_name(), () => {
	it("works", () => {
		expect(is_whitespace("")).to.equal(true)
		expect(is_whitespace("a")).to.equal(false)
		expect(is_whitespace("a   ")).to.equal(false)
		expect(is_whitespace("    ")).to.equal(true)
		expect(is_whitespace("\t\n\r\n")).to.equal(true)
	})
})
