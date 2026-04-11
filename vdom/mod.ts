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
import { Logger } from "@beo/log"

const logger = new Logger("@beo/vdom")

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
	#dom: DOM | undefined = undefined

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
	/**
	 * Called when the DOM reference updates
	 */
	abstract onUpdateDom(): void

	//#region life
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

	/**
	 * Register a callback for when the living status of this node changes.
	 * @param listener The listener to add
	 * @returns A cleanup method
	 */
	addLivingListener(listener: IsLivingListener): () => void {
		this.#isLivingListeners.add(listener)

		return () => {
			this.#isLivingListeners.delete(listener)
		}
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
		this.#updateChildrenDom()

		this.onUpdateChildren()
	}

	/**
	 * The children of this element
	 */
	get children(): VDOMNode[] {
		return this.#children
	}
	//#endregion
	//#region dom
	#updateChildrenDom() {
		if (!this.#dom) return
		for (const child of this.#children) {
			if (child.dom) continue
			child.dom = this.#dom
		}
	}

	get dom(): DOM | undefined {
		return this.#dom
	}

	set dom(value: DOM | undefined) {
		if (!value) return
		this.#dom ??= value
		this.#updateChildrenDom()
		this.onUpdateDom()
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

	override onUpdateDom(): void {}

	override getEffectiveChildren(): DOMNode[] {
		return this.children.flatMap((it) => it.getEffectiveChildren())
	}

	override toString(): string {
		return `<${this.children}>`
	}
}

/**
 * A vdom version of a real node
 */
export class VDOMElement extends VDOMNode {
	node: DOMNode | undefined

	#name: string = ""

	#deferred: ((node: DOMNode) => void)[] = []

	/**
	 * Runs a given callback once this vdom node has a real counterpart
	 * @param callback The callback to run
	 */
	defer(callback: (node: DOMNode) => void) {
		this.#deferred.push(callback)
		this.#processDeferred()
	}

	#processDeferred() {
		if (!this.node) return

		this.#deferred.forEach((it) => it(this.node!))

		this.#deferred = []
	}

	#tryInitNode() {
		logger.debug(
			["tryInitNode", this.toString(), !this.node && this.dom && true],
		)
		if (!this.node && this.dom) {
			this.node = this.dom.createNode(this.#name)
			this.onUpdateChildren()
			this.parent?.onUpdateChildren()
			this.#processDeferred()
		}
	}

	setAttribute(key: string, value: any) {
		this.defer((node) => {
			node.setAttribute(key, value)
		})
	}

	override onUpdateDom(): void {
		this.#tryInitNode()
	}

	override toString(): string {
		return `${this.#name || this.node}(${this.children})`
	}

	constructor(name: string | DOMNode) {
		super()
		if (typeof name === "string") {
			this.#name = name
		} else {
			this.node = name
		}
	}

	override onUpdateChildren(): void {
		this.node?.setChildren(
			this.children.flatMap((it) => it.getEffectiveChildren()),
		)
	}

	override getEffectiveChildren(): DOMNode[] {
		if (this.node) {
			logger.debug(["effective children", this.toString()])
			return [this.node]
		}
		logger.debug(["no effective children", this.toString()])
		return []
	}
}
