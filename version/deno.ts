import { assert } from "@std/assert"
import { glob } from "node:fs/promises"
import { type Package, packageFromJsonPath } from "./pkg.ts"
import { resolve } from "@std/path"

export type NamedPackage = {
	name: string
	version: string
}

export type DenoJson = NamedPackage | {
	workspace: string[]
}

export async function getPackagesInWorkspace() {
	const denoJson: DenoJson = JSON.parse(await Deno.readTextFile("./deno.json"))

	assert("workspace" in denoJson)

	const packages: Package[] = []

	for (const workspaceEntry of denoJson.workspace) {
		for await (const detection of glob(workspaceEntry)) {
			const path = resolve(detection, "deno.json")

			packages.push(await packageFromJsonPath(path))
		}
	}

	await Deno.writeTextFile("./deno.json", printDenoJson(denoJson))

	return packages
}

export function printDenoJson(json: DenoJson): string {
	let keyOrder = [
		"name",
		"license",
		"version",
		"workspace",
		"import",
		"exports",
		"tasks",
		"compilerOptions",
		"fmt",
		"lint",
		...Object.keys(json).toSorted(),
	]

	keyOrder = keyOrder.filter((it) => it in json)

	const cleaned: Record<string, any> = {}

	for (const key of keyOrder) {
		cleaned[key] = (json as any)[key]
	}

	return JSON.stringify(cleaned, undefined, "\t")
}
