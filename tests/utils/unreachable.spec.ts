import { inspectError, testName } from "@/testing"
import { unreachable } from "@/utils"
import { expect } from "@tests/chai"


describe(testName(), () => {
	it("works", () => {
		expect(inspectError(() => {
			unreachable()
		})).to.throw(`This error should never happen, please file a bug report.`)
	})
	it("works with custom message", () => {
		expect(inspectError(() => {
			unreachable("message")
		})).to.throw("message")
	})
})
