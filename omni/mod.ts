/**
 * This is designed to be a portable protocol for DOM-esque platforms (mobile, the web, native)
 *
 * @example
 * ```typescript
 * import { WebDOM } from "@beo/omni-web"
 *
 * const webDom = new WebDOM(document.body)
 *
 * const paragraph = webDom.createNode("p");
 *
 * const text = webDom.createNode("text")
 *
 * text.setAttribute("text", "hello, world!")
 *
 * paragraph.setChildren([text])
 *
 * webDom.getRootNode().setChildren([paragraph])
 * ```
 *
 * @module omni
 */

/**
 * An implementation of a DOM, whether it be on the web, mobile, etc.
 */
export interface DOM {
	createNode(nodeType: string & object | "text"): DOMNode
	getRootNode(): DOMNode
}

/**
 * A generic DOM node
 */
export interface DOMNode {
	/**
	 * Sets an attribute/parameter on a DOM node
	 * @param key The key to set
	 * @param value The value to set it to
	 */
	setAttribute(key: string, value: any): void

	/**
	 * Subscribe to attribute value updates
	 * @param key The attribute to subscribe to
	 * @param callback A callback with attribute data
	 * @returns A cleanup method
	 */
	addValueEventListener(
		key: string,
		callback: (value: any) => void,
	): () => void

	/**
	 * Subscribe to events
	 * @param key The event to subscribe to
	 * @param callback A callback that takes in the event object
	 * @returns A cleanup method
	 */
	addEventListener(
		key: string,
		callback: (value: any) => void,
	): () => void

	/**
	 * Update the children for a DOM node
	 * @param newChildren The new children for the node
	 */
	setChildren(newChildren: DOMNode[]): void
}
