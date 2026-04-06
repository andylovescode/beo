import {
	createBaseSignal,
	type Signal,
	type SignalCallbacks,
} from "./signal.ts"

/**
 * A signal that can be imperatively updated
 */
export interface State<T> extends Signal<T> {
	/**
	 * Set a new value for the signal
	 * @param value The next value of the signal
	 */
	set(value: T): void
}

/**
 * A signal that can be imperatively updated
 * @param initialValue The initial value of the state
 * @returns An updatable signal
 */
export function state<T>(initialValue: T, name = "state"): State<T> {
	const callbacks: Set<SignalCallbacks<T>> = new Set()
	let value = initialValue

	return createBaseSignal<State<T>, T>({
		toString() {
			return name
		},
		$_getNoReact() {
			return value
		},
		set(next) {
			value = next
			for (const callback of callbacks) {
				callback.markedDirty?.()
			}
			for (const callback of callbacks) {
				callback.valueChanged?.(value)
			}
		},
		addCallbacks(it) {
			callbacks.add(it)
		},
		removeCallbacks(it) {
			callbacks.delete(it)
		},
		flags: 0,
	})
}
