/**
 * This is a minimal version manager
 *
 * @example
 * - initializing a repo: glhf
 * - releasing: `deno run jsr:@beo/version --release`
 * - adding a change: `deno run jsr:@beo/version --add`
 *
 * @module beo_version
 */

import { sync } from "./sync.ts"
import { parseArgs } from "@std/cli"
import { add } from "./add.ts"
import { release } from "./release.ts"

const args = parseArgs(Deno.args, {
	boolean: ["add", "release"],
})

if (args.add)
	await add()

if (args.release)
	await release()

await sync()
