import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createRangeSelection, $getSelection, $isParagraphNode, $isRangeSelection, $setSelection, TextNode } from 'lexical';
import { useEffect } from 'react';
import { $createHeadingNode } from '../nodes/HeadingNode';

function HeadingPlugin() {
    const [editor] = useLexicalComposerContext()
    useEffect(() => {
        editor.registerNodeTransform(TextNode, (node: TextNode) => {
            const selection = $getSelection()

            if (selection && $isRangeSelection(selection) && selection.isCollapsed()) {

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
                        parent.replace(headingNode, true)

                        // get real text content
                        const text = textContext.substring(headingLevel + 1, textContext.length)
                        node.setTextContent(text)

                        // reselect original offset
                        const newSelection = $createRangeSelection()
                        const offset = selection.anchor.offset - (headingLevel + 1)
                        newSelection.anchor.set(node.getKey(), offset, 'text')
                        newSelection.focus.set(node.getKey(), offset, 'text')
                        $setSelection(newSelection)
                    }
                }
            }

        })
    }, [editor])
    return null

}

export { HeadingPlugin }
