/**
 * A web omni backend
 *
 * @module omni_web
 */

import type { DOM, DOMNode } from "@beo/omni"

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
			if (
				!(child instanceof WebDOMNode) && !(child instanceof WebDOMTextNode)
			) {
				throw new Error("Expected a WebDOMNode, did not get that")
			}
		}

		this.#real.replaceChildren(...children)
	}

	addValueEventListener(
		_key: string,
		_callback: (value: any) => void,
	): () => void {
		throw new Error("not implemented")
	}

	addEventListener(key: string, callback: (value: any) => void): () => void {
		this.#real.addEventListener(key, callback)

		return () => this.#real.removeEventListener(key, callback)
	}
}

export class WebDOMTextNode implements DOMNode {
	#real: Text

	constructor(real: Text) {
		this.#real = real
	}

	setAttribute(key: string, value: any): void {
		if (key === "text") {
			this.#real.textContent = value
		} else {
			throw new Error("invalid key")
		}
	}

	setChildren(_newChildren: DOMNode[]): void {
		throw new Error("cannot replace children on a text node")
	}

	addValueEventListener(
		_key: string,
		_callback: (value: any) => void,
	): () => void {
		throw new Error("cannot listen to attributes on a text node")
	}

	addEventListener(key: string, callback: (value: any) => void): () => void {
		this.#real.addEventListener(key, callback)

		return () => this.#real.removeEventListener(key, callback)
	}
}
