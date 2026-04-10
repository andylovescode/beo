/**
 * The composition API is a relatively low-level API designed for build tools
 *
 * @module framework_composition
 */

import { VDOMElement, VDOMFragment, type VDOMNode } from "@beo/vdom"
import { must } from "@beo/error"

/**
 * The internal state that gets passed between composers
 */
export interface CompositionState {
	node?: VDOMNode
}

/**
 * A composer that modifies composition state
 */
export type Composer = (state: CompositionState) => void

/**
 * Enter a VDOMElement into a composition
 * @param name The element name
 */
export function compose_element(name: string): Composer {
	return function (state: CompositionState) {
		state.node = new VDOMElement(name)
	}
}

/**
 * Enter a VDOMFragment into a composition
 * @param state The state
 */
export function compose_fragment(state: CompositionState) {
	state.node = new VDOMFragment()
}

/**
 * Enter a node attribute into a composition
 * @param key
 * @param value
 */
export function compose_staticAttribute(
	key: string,
	value: string,
): Composer {
	return function (state: CompositionState) {
		must(state.node, "no node introduced in composition chain")
		must(
			state.node instanceof VDOMElement,
			"node introduced in composition chain is not an element",
		)

		state.node.defer((node) => node.setAttribute(key, value))
	}
}

/**
 * Enter a list of children into a composition
 * @param children
 */
export function compose_staticChildren(
	children: VDOMNode[],
): Composer {
	return function (state: CompositionState) {
		must(state.node, "no node introduced in composition chain")

		state.node.children = children
	}
}

/**
 * Compose several composers into a VDOMNode
 * @param composers
 */
export function compose(...composers: Composer[]): VDOMNode {
	const state: CompositionState = {}

	for (const composer of composers) {
		composer(state)
	}

	must(state.node, "composition chain must introduce a node")

	return state.node
}
