import { type Signal, subscribe } from "./signal.ts"

/**
 * A helper to test signal updates
 * @param signal The signal to subscribe to
 * @returns A list of intermediate signal values
 */
export function testUpdates<T>(signal: Signal<T>): T[] {
	const values: T[] = []

	subscribe(signal, (it) => {
		values.push(it)
	})

	return values
}

/**
 * A benchmarking helper for tests
 * @param func The function to wrap
 * @returns An object containing the wrapped function alongside the number of invokations
 */
export function countInvokations<T extends (...args: unknown[]) => unknown>(
	func: T,
): { count: number; fn: (...args: Parameters<T>) => ReturnType<T> } {
	const self = {
		count: 0,
		fn(...args: Parameters<T>): ReturnType<T> {
			self.count++
			return func(...args) as ReturnType<T>
		},
	}

	return self
}
