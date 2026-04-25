/**
 * A minimal codebase task manager
 *
 * @module plan
 */

import { TodoDatabase } from "./watcher.ts"

async function main() {
	const db = new TodoDatabase()

	await db.initialScan()
	await db.writeTodoMD()
}

if (import.meta.main) {
	await main()
}
