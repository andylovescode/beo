import { Input } from "@cliffy/prompt/input"
import { prompt } from "@cliffy/prompt/prompt"
import { Select } from "@cliffy/prompt/select"
import { assert } from "@std/assert/assert"
import { type ChangeSize, readChangelog, writeChangelog } from "./change.ts"
import { getPackagesInWorkspace } from "./deno.ts"

export async function add() {
	const packages = await getPackagesInWorkspace()

	const { pkg, changeName, type } = await prompt([
		{
			name: "pkg",
			message: "Which package did you change?",
			type: Select,
			options: packages.map((it) => it.json.name),
		},
		{
			name: "type",
			message: "How much did you change it?",
			type: Select,
			options: ["major", "minor", "patch"], // epoch is big enough that you have to use toml
		},
		{
			name: "changeName",
			message: "What should I show in the changelog?",
			type: Input,
		},
	])

	assert(pkg && changeName && type)

	const changes = await readChangelog()

	changes.push({
		name: changeName,
		package: pkg,
		type: type as ChangeSize,
	})

	await writeChangelog(changes)
}
