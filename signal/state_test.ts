import { testUpdates } from "./signal_test.ts"
import { state } from "./state.ts"
import { assertEquals } from "@std/assert"

Deno.test({
	name: "state update callbacks",
	fn() {
		const x = state(0)

		const values = testUpdates(x)

		x.set(1)
		x.set(2)

		assertEquals(values, [0, 1, 2])
	},
})
