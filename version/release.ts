import { readChangelog, writeChangelog } from "./change.ts"

export async function release() {
	const changes = await readChangelog()

	changes.push({
		type: "release",
	})

	await writeChangelog(changes)
}
