import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $isParagraphNode, TextNode } from 'lexical';
import { useEffect } from 'react';
import { $createHeadingNode } from '../nodes/HeadingNode';

function HeadingPlugin() {
    const [editor] = useLexicalComposerContext()
    useEffect(() => {
        editor.registerNodeTransform(TextNode, (node: TextNode) => {
            const textContext = node.getTextContent()
            const regex = /^#{1,6}(?=\s)/g
            let result = regex.exec(textContext)
            if (result && result.length === 1) {
                // if (1) result exists, and (2) paragraph node
                // then we need to transform the paragraph node to a heading node
                const parent = node.getParent()
                if (parent && $isParagraphNode(parent)) {
                    const headingLevel = result[0].length
                    const headingNode = $createHeadingNode(headingLevel)
                    parent.replace(headingNode,false)
                    headingNode.select()
                }
            }
        })
    }, [editor])
    return null

}

export { HeadingPlugin }
