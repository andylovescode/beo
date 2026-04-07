/**
 * A web omni backend
 *
 * @module omni_web
 */

import type { DOM, DOMNode } from "@beo/omni"
import { error, must, todo } from "@beo/error"

/**
 * An omni interface for the web
 */
export class WebDOM implements DOM {
	#rootNode: WebDOMNode

	constructor(root: HTMLElement) {
		this.#rootNode = new WebDOMNode(root)
	}

	createNode(nodeType: string): WebDOMNode | WebDOMTextNode {
		if (nodeType === "text") {
			return new WebDOMTextNode(new Text(""))
		}
		return new WebDOMNode(document.createElement(nodeType))
	}

	getRootNode(): DOMNode {
		return this.#rootNode
	}
}

/**
 * An omni interface for HTMLElements
 */
export class WebDOMNode implements DOMNode {
	#real: HTMLElement

	constructor(real: HTMLElement) {
		this.#real = real
	}

	setAttribute(key: string, value: any): void {
		this.#real.setAttribute(key, `${value}`)
	}

	setChildren(newChildren: DOMNode[]): void {
		const children: Node[] = []

		for (const child of newChildren) {
			must(
				(child instanceof WebDOMNode) || (child instanceof WebDOMTextNode),
				"child must be a web node",
			)
			children.push(child.getReal())
		}

		this.#real.replaceChildren(...children)
	}

	addValueEventListener(
		_key: string,
		_callback: (value: any) => void,
	): () => void {
		todo("addValueEventListener not implemented")
	}

	addEventListener(key: string, callback: (value: any) => void): () => void {
		this.#real.addEventListener(key, callback)

		return () => this.#real.removeEventListener(key, callback)
	}

	getReal(): HTMLElement {
		return this.#real
	}
}

/**
 * An omni interface for Text nodes
 */
export class WebDOMTextNode implements DOMNode {
	#real: Text

	constructor(real: Text) {
		this.#real = real
	}

	getReal(): Text {
		return this.#real
	}

	setAttribute(key: string, value: any): void {
		must(key === "text", "key must be text")

		this.#real.textContent = value
	}

	setChildren(_newChildren: DOMNode[]): void {
		error("cannot replace children on a text node")
	}

	addValueEventListener(
		_key: string,
		_callback: (value: any) => void,
	): () => void {
		error("cannot listen to attributes on a text node")
	}

	addEventListener(key: string, callback: (value: any) => void): () => void {
		this.#real.addEventListener(key, callback)

		return () => this.#real.removeEventListener(key, callback)
	}
}
