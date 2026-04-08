/**
 * A virtual dom layer around omni
 */

import type { DOM, DOMNode } from "@beo/omni"

/**
 * A callback for if a VDOMNode is living or not
 */
export type IsLivingListener = (value: boolean) => void

export abstract class VDOMNode {
	#parent: VDOMNode | undefined = undefined
	#children: VDOMNode[] = []
	#pinnedDom: DOM | undefined = undefined

	#isPinnedRoot: boolean = false
	#isLiving = false

	#isLivingListeners: Set<IsLivingListener> = new Set()

	abstract onUpdateChildren(): void
	abstract getEffectiveChildren(): DOMNode[]

	set isLiving(value: boolean) {
		if (this.#isLiving === value) return

		this.#isLiving = value

		for (const listener of this.#isLivingListeners) {
			listener(this.#isLiving)
		}

		this.#updateChildrenLiving()
	}

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

	get isPinnedRoot(): boolean {
		return this.#isPinnedRoot
	}

	#updateChildrenLiving() {
		for (const child of this.#children) {
			child.isLiving = this.#isLiving || this.#isPinnedRoot
		}
	}

	//#region dom reference
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

	get children(): VDOMNode[] {
		return this.#children
	}
	//#endregion
}

export class VDOMFragment extends VDOMNode {
	override onUpdateChildren(): void {
		this.parent?.onUpdateChildren()
	}

	override getEffectiveChildren(): DOMNode[] {
		return this.children.flatMap((it) => it.getEffectiveChildren())
	}
}

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
