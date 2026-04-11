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

type TrueBooleanKeys<T> = keyof ({
	[k in keyof T]: T[k] extends true ? { [x in k]: true } : never
})[keyof T]

/**
 * Validates the type of an object
 * @param it The object to check the type of
 * @param key A true boolean key only in `T`
 * @returns true, if `it` is the desired type
 */
export function is<T>(it: unknown, key: TrueBooleanKeys<T>): it is T {
	return (typeof it === "object" && it && key in it &&
			(it as any)[key] === true)
		? true
		: false
}
