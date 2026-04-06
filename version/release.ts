import { readChangelog, writeChangelog } from "./change.ts"

export async function release() {
	const changes = await readChangelog()

	const latestChange = changes.at(-1)

	if (latestChange && latestChange.type === "release") {
		console.log("[info]: a release just happened, not doing anything")
		Deno.exit(0)
	}

	changes.push({
		type: "release",
	})

	await writeChangelog(changes)
}
