/**
 * This is a minimal version manager.
 *
 * @example
 * To create a project, write the following to `changes.toml`
 * ```toml
 * [[change]]
 * type = "release"
 * ```
 * @example
 * To add a changelog entry for a package, run
 * ```bash
 * deno run jsr:@beo/version --add
 * ```
 * @example
 * To release all packages and bump versions, run
 * ```bash
 * deno run jsr:@beo/version --release
 * ```
 * @module beo_version
 */

import { sync } from "./sync.ts"
import { parseArgs } from "@std/cli"
import { add } from "./add.ts"
import { release } from "./release.ts"

const args = parseArgs(Deno.args, {
	boolean: ["add", "release"],
})

if (args.add) {
	await add()
}

if (args.release) {
	await release()
}

await sync()
