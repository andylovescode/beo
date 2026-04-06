/**
 * This is a signal library, and it is fast.
 *
 * # What is it
 *
 * Signals are a reactive primitive, they're like a variable, but you can observe when they change.
 *
 * This library provides a signal paradigm, alongside features for creating signals based on other signals, with the minimum number of re-evaluations.
 *
 * @example
 * Create a signal
 * ```typescript
 * import { state } from "@beo/signal"
 *
 * const x = state(0)
 * ```
 *
 * @example
 * Create a derived signal
 * ```typescript
 * import { state, derived } from "@beo/signal"
 *
 * const x = state(0)
 * const doubled = derived(() => x() * 2)
 *
 * @example
 * Get the value of a signal
 * ```typescript
 * import { state } from "@beo/signal"
 *
 * const x = state(0)
 *
 * console.log(x()) // 0
 *
 * x.set(2)
 *
 * @example
 * Subscribe to signal changes
 * ```typescript
 * import { state, subscribe } from "@beo/signal"
 *
 * const x = state(0)
 *
 * subscribe(x, (value) => {
 *      console.log(x)
 * }) // 0
 *
 * x.set(2) // 2
 *
 * ```
 *
 * @module signal
 */

export * from "./derived.ts"
export * from "./state.ts"
export * from "./signal.ts"
