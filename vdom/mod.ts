/**
 * A virtual dom layer around omni
 *
 * > [!IMPORTANT]
 * >
 * > This is a very low-level library, consider not using it.
 *
 * @example
 * ```typescript
 * import { WebDOM } from "@beo/omni-web"
 * import { VDOMElement } from "@beo/vdom"
 *
 * const webDom = new WebDOM(document.body)
 * const root = new VDOMElement(webDom.getRootNode())
 * const paragraph = new VDOMElement(webDom.createNode("p"))
 * const text = new VDOMElement(webDom.createNode("text"))
 *
 * text.node.setAttribute("text", "hello, world!")
 *
 * paragraph.children = [text]
 *
 * root.children = [paragraph]
 *
 * console.log(root.isLiving)
 * root.isPinnedRoot = true
 * console.log(paragraph.isLiving)
 * ```
 *
 * @module vdom
 */

import type { DOM, DOMNode } from "@beo/omni"

/**
 * A callback for if a VDOMNode is living or not
 */
export type IsLivingListener = (value: boolean) => void

/**
 * A node in the virtual DOM
 */
export abstract class VDOMNode {
	#parent: VDOMNode | undefined = undefined
	#children: VDOMNode[] = []
	#pinnedDom: DOM | undefined = undefined

	#isPinnedRoot: boolean = false
	#isLiving = false

	#isLivingListeners: Set<IsLivingListener> = new Set()

	/**
	 * Called when the list of children changes
	 */
	abstract onUpdateChildren(): void
	/**
	 * Return the list of real dom nodes that this represents
	 */
	abstract getEffectiveChildren(): DOMNode[]

	set isLiving(value: boolean) {
		if (this.#isLiving === value) return

		this.#isLiving = value

		for (const listener of this.#isLivingListeners) {
			listener(this.#isLiving)
		}

		this.#updateChildrenLiving()
	}

	/**
	 * Is this a descendent of an isPinnedRoot element
	 */
	get isLiving(): boolean {
		return this.#isLiving
	}

	set isPinnedRoot(value: boolean) {
		if (this.#isPinnedRoot === value) return

		this.#isPinnedRoot = value
		this.#isLiving = value || (this.parent?.isLiving ?? false)

		for (const listener of this.#isLivingListeners) {
			listener(this.#isLiving)
		}

		this.#updateChildrenLiving()
	}

	/**
	 * Should the descendents of this have isLiving be true
	 */
	get isPinnedRoot(): boolean {
		return this.#isPinnedRoot
	}

	#updateChildrenLiving() {
		for (const child of this.#children) {
			child.isLiving = this.#isLiving || this.#isPinnedRoot
		}
	}

	//#region dom reference
	/**
	 * A reference to the DOM api associated with this element
	 */
	get dom(): DOM | undefined {
		if (!this.#pinnedDom) {
			this.#pinnedDom = this.#parent?.dom
		}

		return this.#pinnedDom
	}

	set dom(value: DOM | undefined) {
		this.#pinnedDom = value
	}
	//#endregion

	//#region parent hierarchy
	/**
	 * The parent of this element (read-only)
	 */
	get parent(): VDOMNode | undefined {
		return this.#parent
	}

	set children(value: VDOMNode[]) {
		this.#children.forEach((it) => {
			if (!value.includes(it)) {
				it.#parent = undefined
				it.isLiving = false
			}
		})

		this.#children = value

		this.#children.forEach((it) => {
			it.#parent = this
		})

		this.#updateChildrenLiving()

		this.onUpdateChildren()
	}

	/**
	 * The children of this element
	 */
	get children(): VDOMNode[] {
		return this.#children
	}
	//#endregion
}

/**
 * A node with no existence in the real dom, but its children are direct children of the first non-fragment parent
 */
export class VDOMFragment extends VDOMNode {
	override onUpdateChildren(): void {
		this.parent?.onUpdateChildren()
	}

	override getEffectiveChildren(): DOMNode[] {
		return this.children.flatMap((it) => it.getEffectiveChildren())
	}
}

/**
 * A vdom version of a real node
 */
export class VDOMElement extends VDOMNode {
	node: DOMNode

	constructor(node: DOMNode) {
		super()

		this.node = node
	}

	override onUpdateChildren(): void {
		this.node.setChildren(
			this.children.flatMap((it) => it.getEffectiveChildren()),
		)
	}

	override getEffectiveChildren(): DOMNode[] {
		return [this.node]
	}
}
