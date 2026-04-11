import { VDOMFragment, type VDOMNode } from "@beo/vdom"
import { getGlobalReference } from "@beo/global"
import { must } from "@beo/error"

/**
 * A global reference to the root VDOMNode of the component being actively rendered
 */
export const componentCurrentRenderedVDOMNode: { value: VDOMNode | undefined } =
	getGlobalReference({
		author: "beo",
		ref: "componentCurrentRenderedVDOMNode",
		version: 0,
		default() {
			return { value: undefined }
		},
	})

/**
 * Used to declare components
 * @param funct The component implementation
 * @returns The component
 */
export function component<Props extends Record<string, unknown>>(
	funct: (props: Props) => FrameworkNode,
): (props: Props) => FrameworkNode {
	return (props) => {
		const container = new VDOMFragment()

		const previous = componentCurrentRenderedVDOMNode.value

		componentCurrentRenderedVDOMNode.value = container

		const inner = funct(props)

		container.children = [inner]

		componentCurrentRenderedVDOMNode.value = previous

		return container
	}
}

/**
 * Call a function when a component is mounted
 * @param callback The code to run upon mounting, which can return a destructor
 * @param root The VDOMNode to watch, defaults to the current component
 */
export function onMount(
	callback: () => (() => void) | void,
	root: VDOMNode | undefined = componentCurrentRenderedVDOMNode.value,
) {
	let isLiving = false
	let onDeath = () => {}

	must(root, "no component is being rendered")

	root.addLivingListener((living) => {
		if (isLiving === living) return

		isLiving = living

		if (living) {
			onDeath = callback() ?? (() => {})
		}

		if (!living) {
			onDeath()
		}
	})
}

/**
 * An alias for VDOMNode to make people not have to think as hard
 */
export type FrameworkNode = VDOMNode
