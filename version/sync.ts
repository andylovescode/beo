import { resolve } from "node:path"
import { type Change, readChangelog } from "./change.ts"
import { getPackagesInWorkspace, printDenoJson } from "./deno.ts"
import { type Package, releasePackage } from "./pkg.ts"
import { printVersion } from "./version.ts"

export async function sync() {
	const packages: Package[] = await getPackagesInWorkspace()

	const changes: Change[] = await readChangelog()

	for (const change of changes) {
		if (change.type === "release") {
			for (const pkg of packages) {
				releasePackage(pkg)
			}
			continue
		}

		const pkg = packages.find((it) => it.json.name.includes(change.package))

		if (!pkg) {
			console.warn(
				`[warn]: failed to find package matching name ${change.package}`,
			)
			continue
		}

		pkg.unreleasedChanges.push(change)
	}

	for (const pkg of packages) {
		pkg.json.version = printVersion(pkg.version)
		await Deno.writeTextFile(
			pkg.path,
			printDenoJson(pkg.json),
		)
		await Deno.writeTextFile(
			resolve(pkg.path, "../CHANGELOG"),
			pkg.changelog.join("\n"),
		)
	}
}
