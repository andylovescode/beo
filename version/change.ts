import * as v from "@valibot/valibot"
import * as TOML from "@std/toml"

export const bumpSchema = v.object({
	type: v.union([
		v.literal("major"),
		v.literal("minor"),
		v.literal("patch"),
		v.literal("epoch"),
	]),
	package: v.string(),
	name: v.string(),
})

export const releaseSchema = v.object({
	type: v.literal("release"),
})

export const changeSchema = v.union([bumpSchema, releaseSchema])

export type Change = v.InferOutput<typeof changeSchema>
export type Release = v.InferOutput<typeof releaseSchema>
export type Bump = v.InferOutput<typeof bumpSchema>

export type ChangeSize = "major" | "minor" | "patch" | "epoch"

export function maxChangeSize(...sizes: ChangeSize[]): ChangeSize {
	const list: ChangeSize[] = ["patch", "minor", "major", "epoch"]

	return list[Math.max(...sizes.map((it) => list.indexOf(it)))]
}

export async function readChangelog() {
	let changes: Change[] = []

	try {
		changes = TOML.parse(await Deno.readTextFile("./changes.toml"))
			.change as Change[]
	} catch {
		console.error(`[err]: no changes.toml!!`)
		Deno.exit(1)
	}

	v.assert(v.array(changeSchema), changes)

	return changes
}

export async function writeChangelog(changes: Change[]) {
	await Deno.writeTextFile(
		"./changes.toml",
		TOML.stringify({ change: changes }),
	)
}
