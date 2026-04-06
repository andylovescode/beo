import { getGlobalReference } from "@beo/global"

/**
 * A callback that takes in signals that have been polled
 */
export interface SignalPolledCallback {
	// deno-lint-ignore no-explicit-any
	(signal: Signal<any>): void
}

/**
 * A collection of various callbacks pertaining to a signal
 */
export interface SignalCallbacks<T> {
	valueChanged?(value: T): void
	markedDirty?(): void
}

/**
 * The last item of this array should be called whenever a signal is polled
 */
export const signalPolledCallbackStack: SignalPolledCallback[] =
	getGlobalReference<
		SignalPolledCallback[]
	>({
		default() {
			return [() => {}]
		},
		version: 0,
		author: "beo",
		ref: "signal-polled-callback-stack",
	})

//#region flags
/**
 * This signal needs to be re-evaluated, but hasn't been yet, likely because of its dependencies being dirty
 */
export const flag_dirty = 0b00000001
//#endregion flags

//#region helpers
/**
 * Listen for changes on a signal
 * @param signal The signal to subscribe to
 * @param callback A callback called when the value changes, and when subscribe is first called
 * @returns A function to stop listening for changes
 */
export function subscribe<T>(
	signal: Signal<T>,
	callback: (value: T) => void,
): () => void {
	const callbacks: SignalCallbacks<T> = {
		valueChanged: callback,
	}

	signal.addCallbacks(callbacks)
	callback(signal.$_getNoReact())

	return () => {
		signal.removeCallbacks(callbacks)
	}
}

/**
 * Makes a signal callable and automatically call the signal polled callback
 * @param signal The signal with a $_getInternal function
 * @returns A callable signal
 */
export function createBaseSignal<SignalType extends Signal<T>, T>(
	signal: {
		[key in keyof SignalType]: SignalType[key]
	},
): SignalType {
	const result = (() => {
		signalPolledCallbackStack.at(-1)!(result)
		return signal.$_getNoReact()
	}) as SignalType
	Object.defineProperties(result, Object.getOwnPropertyDescriptors(signal))
	return result
}
//#endregion

/**
 * A reactive value
 */
export interface Signal<T> {
	/**
	 * Get the value of the signal
	 *
	 * The top item on the signal polling callback stack gets invoked with this signal when this is called
	 */
	(): T

	/**
	 * INTERNAL - get the signal value without running callbacks
	 * @see signalPolledCallbackStack
	 */
	$_getNoReact(): T

	/**
	 * Adds a callback object to be notified of signal activity
	 *
	 * End users should likely not need to use this, as this is a heavy-handed API
	 *
	 * @see subscribe for a lighter alternative
	 *
	 * @param callbacks The callbacks to add
	 */
	addCallbacks(callbacks: SignalCallbacks<T>): void

	/**
	 * Removes a ballback object
	 *
	 * @param callbacks The callbacks to remove
	 */
	removeCallbacks(callbacks: SignalCallbacks<T>): void

	/**
	 * @see flag_dirty and the adjacent flags for more information
	 */
	flags: number

	/**
	 * Converts to a string
	 */
	toString(): string
}
