/**
 * A small duck-typing library
 *
 * @example
 * ```typescript
 * import { is } from "@beo/duck"
 *
 * const isASignal = is(it, "isSignal")
 * ```
 *
 * @module duck
 */

import type { Signal } from "@beo/signal"

type TrueBooleanKeys<T> = keyof ({
	[k in keyof T]: T[k] extends true ? { [x in k]: true } : never
})[keyof T]

export function is<T>(it: unknown, key: TrueBooleanKeys<T>): it is T {
	return (typeof it === "object" && it && key in it &&
			(it as any)[key] === true)
		? true
		: false
}
