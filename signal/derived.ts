import {
	createBaseSignal,
	flag_dirty,
	type Signal,
	type SignalCallbacks,
	signalPolledCallbackStack,
} from "./signal.ts"

/**
 * Creates a derived signal
 *
 * @example
 * ```typescript
 * import { state, doubled } from "@beo/signal"
 *
 * const x = state(0)
 * const doubled = derived(() => x() * 2)
 * x.set(x() + 1)
 * console.log(doubled()) // 2
 * ```
 *
 * @param getter Returns the value of the signal, based on other signals
 * @returns A signal based on other signals
 */
export function derived<T>(getter: () => T, name = "signal"): Signal<T> {
	const dependencies = new Set<Signal<unknown>>()

	signalPolledCallbackStack.push(addDependency)
	let value = getter()
	signalPolledCallbackStack.pop()

	const callbacks: Set<SignalCallbacks<T>> = new Set()
	let awake = false
	let flags = 0

	const dependencyCallbacks = new Map<
		Signal<unknown>,
		SignalCallbacks<unknown>
	>()

	function addDependency(dep: Signal<unknown>) {
		dependencies.add(dep)
	}

	function invalidate() {
		if (!flag_dirty) return
		for (const dependency of dependencies) {
			if ((dependency.flags & flag_dirty) !== 0) return
		}

		flags &= ~flag_dirty

		signalPolledCallbackStack.push(addDependency)
		value = getter()
		signalPolledCallbackStack.pop()

		for (const callback of callbacks) {
			callback.valueChanged?.(value)
		}
	}

	function markedDirty() {
		if ((flags & flag_dirty) !== 0) return

		flags |= flag_dirty
		for (const callback of callbacks) {
			callback.markedDirty?.()
		}
	}

	function updateWakenness() {
		const shouldBeAwake = callbacks.size > 0

		if (shouldBeAwake && !awake) {
			awake = true

			for (const dependency of dependencies) {
				if (!dependencyCallbacks.has(dependency)) {
					dependencyCallbacks.set(dependency, {
						markedDirty,
						valueChanged: invalidate,
					})
				}
			}

			for (const [dependency, callback] of dependencyCallbacks) {
				dependency.addCallbacks(callback)
			}
		}

		if (awake && !shouldBeAwake) {
			awake = false

			for (const [dependency, callback] of dependencyCallbacks) {
				dependency.removeCallbacks(callback)
			}
		}
	}

	return createBaseSignal<Signal<T>, T>({
		toString() {
			return name
		},
		$_getNoReact() {
			if (!awake) {
				signalPolledCallbackStack.push(addDependency)
				value = getter()
				signalPolledCallbackStack.pop()
			}
			return value
		},
		addCallbacks(it) {
			callbacks.add(it)
			updateWakenness()
		},
		removeCallbacks(it) {
			callbacks.delete(it)
			updateWakenness()
		},
		get flags() {
			return flags
		},
	})
}
