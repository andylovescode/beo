// deno-lint-ignore-file no-namespace
import { must, type todo } from "@beo/error"
import {
	compose,
	compose_dynamicAttribute,
	compose_element,
	compose_fragment,
	compose_staticChildren,
	type CompositionState,
} from "@beo/framework/composition"
import { getGlobalReference } from "@beo/global"
import type { VDOMNode } from "@beo/vdom"
import { is } from "@beo/duck"
import type { Signal } from "../signal/signal.ts"

export const fragment = getGlobalReference({
	default() {
		return Symbol("Fragment")
	},
	version: 0,
	author: "beo",
	ref: "jsx_fragment",
})

function makeNode(it: VDOMNode | string | Signal<string>) {
	if (typeof it === "string" || is<Signal<string>>(it, "isSignal")) {
		return compose(
			compose_element("text"),
			compose_dynamicAttribute("text", it),
		)
	}

	return it
}

export function jsx(
	elementName: unknown,
	props: Record<string, any>,
	key: string,
) {
	const composition: CompositionState = {}

	must(typeof elementName == "string" || elementName === fragment, "components")

	if (key) {
		props[key] = key
	}

	if (typeof elementName == "string") {
		compose_element(elementName)(composition)
	} else if (elementName == fragment) {
		compose_fragment(composition)
	}

	for (const prop in props) {
		if (prop === "children") {
			const children = props[prop]

			compose_staticChildren(children.map(makeNode))(composition) // FIXME: p50 - this may not be static
			continue
		}

		compose_dynamicAttribute(prop, props[prop])(composition)
	}

	must(composition.node, "no node introduced in composition")

	return composition.node
}

export const jsxs = jsx

export type TagNames = keyof HTMLElementTagNameMap

export namespace JSX {
	export type IntrinsicElements = {
		[k in TagNames]: any
	}
	export interface ElementChildrenAttribute {
		children: any
	}
}
