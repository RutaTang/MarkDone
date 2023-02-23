import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $wrapNodeInElement } from '@lexical/utils';
import { $createRangeSelection, $getSelection, $isParagraphNode, $isRangeSelection, $setSelection, TextNode } from 'lexical';
import { useEffect } from 'react';
import { $createQuoteNode, $isQuoteNode } from '../nodes/QuoteNode';

function QuotePlugin() {
    const [editor] = useLexicalComposerContext()
    useEffect(() => {
        editor.registerNodeTransform(TextNode, (node: TextNode) => {
            const selection = $getSelection()

            if (selection && $isRangeSelection(selection) && selection.isCollapsed()) {
                const textContext = node.getTextContent()
                const regex = /^>(?=\s)/g
                let result = regex.exec(textContext)

                if (result && result.length === 1) {
                    const parent = node.getParent()

                    if (!parent || (!$isParagraphNode(parent) && !$isQuoteNode(parent))) {
                        return
                    }

                    // if parent is paragraph node, replace with quote node
                    if ($isParagraphNode(parent)) {
                        const quoteNode = $createQuoteNode()
                        parent.replace(quoteNode, true)
                    }

                    // if parent is quote node, nest a new paragraph node
                    if ($isQuoteNode(parent)) {
                        let newParent = $wrapNodeInElement(parent, $createQuoteNode)
                        newParent.select()
                    }

                    // get real text content
                    const text = textContext.substring(2, textContext.length)
                    node.setTextContent(text)

                    // reselect original offset
                    const newSelection = $createRangeSelection()
                    const offset = selection.anchor.offset - 2
                    newSelection.anchor.set(node.getKey(), offset, 'text')
                    newSelection.focus.set(node.getKey(), offset, 'text')
                    $setSelection(newSelection)
                }
            }
        })
    }, [editor])
    return null

}

export { QuotePlugin }
