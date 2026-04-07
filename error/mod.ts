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

export function error(message: string): never {
	throw new Error(message)
}

class ValidationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "ValidationError"
	}
}

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

export function todo(message: string) {
	throw new NotImplementedError(message)
}
