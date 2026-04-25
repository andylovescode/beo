import { assert, assertEquals } from "@std/assert"
import { parseComment, reprintTodo, scanComments } from "./comments.ts"

Deno.test({
	name: "comment scanning",
	fn() {
		assertEquals(scanComments("// test \n, test2"), ["test"])
	},
})

Deno.test({
	name: "parsing and reprinting",
	fn() {
		const todo = parseComment("todo: test")

		assert(todo)
		assertEquals(reprintTodo(todo), "todo: p50 /// test")
	},
})
