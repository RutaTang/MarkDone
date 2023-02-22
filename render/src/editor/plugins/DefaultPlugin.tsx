import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $findMatchingParent } from '@lexical/utils'
import { $createParagraphNode, $createTextNode, $getRoot, $getSelection, $isElementNode, $isParagraphNode, $isRangeSelection, $isTextNode, COMMAND_PRIORITY_CRITICAL, COMMAND_PRIORITY_NORMAL, ElementNode, KEY_BACKSPACE_COMMAND, KEY_ENTER_COMMAND } from 'lexical';
import { useEffect, useRef } from 'react';

function DefaultPlugin() {
    const [editor] = useLexicalComposerContext()
    useEffect(() => {
        //auto focus
        editor.focus()

        //normalization (key enter): each line is a paragraph
        const unregisterKEC = editor.registerCommand(KEY_ENTER_COMMAND, (e) => {
            //TODO: escape code and math block
            const selection = $getSelection()
            if (selection && $isRangeSelection(selection) && selection.isCollapsed()) {
                // check if selection is in only a signle node and get the node
                const nodes = selection.getNodes()
                if (!nodes || nodes.length !== 1) {
                    return false
                }
                const node = nodes[0]

                // init paragraph node to be inserted
                let paragraphNodeTobeInserted = $createParagraphNode()

                // if the node is element node, insert paragraph node after it
                if ($isElementNode(node)) {
                    node.insertAfter(paragraphNodeTobeInserted)
                    paragraphNodeTobeInserted.select()
                    e?.preventDefault()
                    return true
                }
                // if the node is text node, insert paragraph node depending on the selection offset
                else if ($isTextNode(node)) {
                    // find the recent parent element node
                    let elementParent = $findMatchingParent(node, (node) => {
                        return $isElementNode(node)
                    })
                    if (!elementParent) {
                        throw new Error('Cannot find parent element node')
                    }
                    // at the beginning of the text node
                    if (selection.focus.offset === 0) {
                        elementParent.insertBefore(paragraphNodeTobeInserted)
                    }
                    // at the end of the text node
                    else if (selection.focus.offset === node.getTextContent().length) {
                        elementParent.insertAfter(paragraphNodeTobeInserted)
                        paragraphNodeTobeInserted.select()
                    }
                    // in the middle of the text node, splits the text node
                    else {
                        let textNodes = node.splitText(selection.focus.offset)
                        elementParent.insertAfter(paragraphNodeTobeInserted)
                        const textNode = textNodes[1]
                        paragraphNodeTobeInserted.append(textNode)
                        textNode.selectPrevious()
                    }
                    e?.preventDefault()
                    return true
                }
                // if not throw error
                else {
                    throw new Error('TODO: implement other node types')
                }

            }
            return false
        }, COMMAND_PRIORITY_NORMAL)

        //normalization (key backward): delete back to a paragraph, especially for the first line
        const unregisterKBC = editor.registerCommand(KEY_BACKSPACE_COMMAND, (e) => {
            const selection = $getSelection()
            if (selection && $isRangeSelection(selection) && selection.isCollapsed()) {
                // check if selection is in only a signle node and get the node
                const nodes = selection.getNodes()
                if (!nodes || nodes.length !== 1) {
                    return false
                }
                const node = nodes[0]

                // replace the node with a paragraph node if it is not a paragraph node and it is empty
                if ($isElementNode(node) && node.getChildrenSize() === 0 && !$isParagraphNode(node)) {
                    const paragraphNode = $createParagraphNode()
                    node.replace(paragraphNode, false)
                    paragraphNode.select()
                    e?.preventDefault()
                    return true
                }
            }

            return false
        }, COMMAND_PRIORITY_NORMAL)
        return () => {
            unregisterKEC()
            unregisterKBC()
        }
    }, [editor])
    return null

}

export { DefaultPlugin }
