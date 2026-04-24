import { WebDOM } from "@beo/omni-web"
import { VDOMElement } from "@beo/vdom"
import {
	compose,
	compose_element,
	compose_fragment,
	compose_staticAttribute,
	compose_staticChildren,
} from "@beo/framework/composition"
import { LoggerConfig, setLoggerConfig } from "@beo/log"

{
	const config = new LoggerConfig()
	config.minSeverity = "debug"
	setLoggerConfig(config)
}

const webDom = new WebDOM(document.body)

const root = new VDOMElement(webDom.getRootNode())

/*
 compose(
	compose_fragment,
	compose_staticChildren([
		compose(
			compose_element("p"),
			compose_staticChildren([
				compose(
					compose_element("text"),
					compose_staticAttribute("text", "hello"),
				),
			]),
		),
	]),
)
	*/

const testRoot = (
	<>
		<p>
			<text text="hello" />
		</p>
	</>
)

root.isPinnedRoot = true
root.children = [testRoot]
root.dom = webDom

console.log(testRoot)
