import { WebDOM } from "@beo/omni-web"
import { VDOMElement } from "@beo/vdom"

const webDom = new WebDOM(document.body)

const root = new VDOMElement(webDom.getRootNode())

const paragraph = new VDOMElement(webDom.createNode("p"))

const text = new VDOMElement(webDom.createNode("text"))

text.node.setAttribute("text", "hello, world!")

paragraph.children = [text]

root.children = [paragraph]

console.log(root.isLiving)

root.isPinnedRoot = true

console.log(paragraph.isLiving)
