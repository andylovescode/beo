export function scanComments(file: string): string[] {
	const regex = /\/\/(.*)\n/g

	const matches = file.matchAll(regex) ?? []
	const result: string[] = []

	for (const match of matches) {
		const text = match[1]

		result.push(text.trim())
	}

	return result
}

export const todoTypes = ["todo", "fixme", "polish"] as const
export type TodoType = (typeof todoTypes)[number]
export interface Todo {
	type: TodoType
	priority: number
	message: string
	sourceText: string
	sourceFile?: string
}

export function parseComment(comment: string): Todo | undefined {
	const tokens = comment.split(" ").map((it) => it.trim()).filter((it) =>
		it !== ""
	)

	const message: string[] = []
	let priority = 50
	let type: TodoType | undefined = undefined

	outer: for (const token of tokens) {
		if (token === "///") continue

		pnum: {
			// P-number
			if (!token.startsWith("p")) break pnum
			const number = Number.parseInt(token.slice(1))

			if (Number.isNaN(number)) break pnum

			priority = number

			continue
		}

		for (const possibleType of todoTypes) {
			if (token.toLowerCase() === `${possibleType}:`.toLowerCase()) {
				type = possibleType
				continue outer
			}
		}

		message.push(token)
	}

	if (!type) return undefined

	return {
		priority,
		message: message.join(" "),
		type,
		sourceText: comment,
	}
}

export function reprintTodo(todo: Todo) {
	const resulting = `${todo.type}: p${
		todo.priority.toString().padStart(2, "0")
	} /// ${todo.message}`

	return resulting
}

export function lintTodosInSource(source: string): string | undefined {
	const comments = scanComments(source)
	let result = source

	for (const comment of comments) {
		const parsed = parseComment(comment)

		if (!parsed) continue

		const reprinted = reprintTodo(parsed)

		if (reprinted !== parsed.sourceText) {
			result = result.replace(parsed.sourceText, reprinted)
		}
	}

	if (result !== source) return result

	return result
}
