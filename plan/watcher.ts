import {
	lintTodosInSource,
	parseComment,
	scanComments,
	type Todo,
} from "./comments.ts"
import { walk } from "@std/fs"

export class TodoDatabase {
	todos: Todo[] = []

	deleteFileTodos(file: string) {
		this.todos = this.todos.filter((it) => it.sourceFile !== file)
	}

	#sortTodos() {
		this.todos.sort((a, b) => b.priority - a.priority)
	}

	async lintFile(file: string) {
		const text = await Deno.readTextFile(file)
		const linted = lintTodosInSource(text)

		if (linted) {
			await Deno.writeTextFile(file, linted)
		}
	}

	async updateFromFile(file: string) {
		this.deleteFileTodos(file)

		const text = await Deno.readTextFile(file)

		const comments = scanComments(text)

		for (const comment of comments) {
			const todo = parseComment(comment)

			if (!todo) continue

			todo.sourceFile = file

			this.todos.push(todo)
		}

		this.#sortTodos()
	}

	async writeTodoMD() {
		const lines: string[] = []

		lines.push(`| priority | type | name |`)
		lines.push(`| --- | --- | --- |`)

		for (const todo of this.todos) {
			lines.push(
				`| ${todo.priority} | ${todo.type} | [${todo.message}](${
					todo.sourceFile?.replace("\\", "/")
				}) |`,
			)
		}

		const text = lines.join("\n")

		await Deno.writeTextFile("TODO", text)
	}

	async initialScan() {
		const promises: Promise<void>[] = []

		for await (const file of walk(".")) {
			if (!file.name.endsWith(".ts")) continue

			promises.push(this.updateFromFile(file.path))
			promises.push(this.lintFile(file.path))
		}

		await Promise.all(promises)
	}
}
