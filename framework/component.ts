import { VDOMFragment, type VDOMNode } from "@beo/vdom"

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

		const inner = funct(props)

		container.children = [inner]

		return container
	}
}

/**
 * An alias for VDOMNode to make people not have to think as hard
 */
export type FrameworkNode = VDOMNode
