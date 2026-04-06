/**
 * This is a minimal variable stability tool.
 *
 * It lets a value be the same everywhere, across packages and versions.
 * This is useful for making frameworks, and not a lot else.
 *
 * @example
 * ```typescript
 * const signalUsageCallbackStack = getGlobalReference({
 *     default() {
 *         return [];
 *     },
 *     version: 0,
 *     author: "beo",
 *     ref: "signal-usage-callback"
 * })
 * ```
 *
 * @module global
 */

/**
 * Makes a value globally stable between places that it is imported
 *
 * @param props.default Creates the value of the global reference
 * @param props.version The version of the global reference, for when things are incompatible with the previous version
 * @param props.author An author name, typically a JSR package scope
 * @param props.ref A global key name, not necesarily a package name, but simply the variable you want to be stable
 * @returns
 */
export function getGlobalReference<T>(props: {
	default: () => T
	version: number
	author: string
	ref: string
}): T {
	// deno-lint-ignore no-explicit-any
	const globalReferences = ((globalThis as any)["@beo/global"] ??= {})
	const key = `@${props.author}@${props.ref}~${props.version}`

	return globalReferences[key] ??= props.default()
}
