import { assertEquals } from "@std/assert/equals"
import { derived } from "./derived.ts"
import { countInvokations, testUpdates } from "./signal_test.ts"
import { state } from "./state.ts"

Deno.test({
	name: "derivation performance",
	fn() {
		const x = state(0, "x")
		const x1 = derived(() => x(), "x1")
		const x2 = derived(() => x(), "x2")

		const y = derived(() => x1() + x2(), "y")
		const y1 = derived(() => y(), "y1")
		const y2 = derived(() => y(), "y2")

		const z = derived(() => y1() + y2(), "z")

		const zDoubler = countInvokations(() => z() * 2)

		const phi = derived(zDoubler.fn, "phi")

		const phiValues = testUpdates(phi)

		x.set(1)

		assertEquals(zDoubler.count, 2)
		assertEquals(phiValues, [0, 8])
	},
})
