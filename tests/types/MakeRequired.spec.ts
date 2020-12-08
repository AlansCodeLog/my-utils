import { expect_type, test_name } from "@/testing"
import type { MakeRequired } from "@/types"


describe(test_name(), () => {
	it("works", () => {
		type Base = {a: string, b?: string, c?: {d?: string}}
		type Res = MakeRequired<Base, "c" | "b">
		expect_type<Res, "===", { a: string, b: string, c: {d?: string} }>(true)
		expect_type<Res, "===", { a: string, b?: string, c?: {d?: string} }>(false)
		expect_type<Res, "===", { a: string, b: string, c: {d: string} }>(false)
		expect_type<Res, "===", { a: string }>(false)
	})
})

