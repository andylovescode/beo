/**
 * This is a quality-of-life errors library.
 *
 * @example
 * ```typescript
 * import { error } from "@beo/error"
 *
 * error("this doesn't work")
 * ```
 *
 * @example
 * ```typescript
 * import { must } from "@beo/error"
 *
 * must(x === 2, "x is not two")
 * ```
 *
 * @example
 * ```typescript
 * import { todo } from "@beo/error"
 *
 * todo("this is not implemented")
 * ```
 *
 * @module error
 */

/**
 * Throws an Error
 * @param message the error message
 */
export function error(message: string): never {
	throw new Error(message)
}

class ValidationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "ValidationError"
	}
}

/**
 * Throws a ValidationError if the condition is falsy
 * @param condition The condition to check for
 * @param message The error message
 */
export function must(condition: any, message: string): asserts condition {
	if (!condition) {
		throw new ValidationError(message)
	}
}

class NotImplementedError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "NotImplementedError"
	}
}

/**
 * Throws a NotImplementedError
 * @param message The error to throw
 */
export function todo(message: string): never {
	throw new NotImplementedError(message)
}
