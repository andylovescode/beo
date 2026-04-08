import { WebDOM } from "@beo/omni-web"

const webDom = new WebDOM(document.body)

const paragraph = webDom.createNode("p")

const text = webDom.createNode("text")

text.setAttribute("text", "hello, world!")

paragraph.setChildren([text])

webDom.getRootNode().setChildren([paragraph])
