import { testName } from "@/testing"
import { occurrences } from "@/utils/occurrences"
import { expect } from "@tests/chai"


describe(testName(), () => {
	it("works", () => {
		expect(occurrences("aaa", "a")).to.equal(3)
		expect(occurrences("a a a", "a")).to.equal(3)
		expect(occurrences("aaa", "aa", { overlapping: true })).to.equal(2)
		expect(occurrences("aaa", "aa", { overlapping: false })).to.equal(1)
	})
})
