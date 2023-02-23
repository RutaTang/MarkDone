
import { ElementNode, LexicalNode } from 'lexical';

export class QuoteNode extends ElementNode {
    static getType(): string {
        return 'quote';
    }

    static clone(node: QuoteNode): QuoteNode {
        return new QuoteNode(node.__key);
    }

    createDOM(): HTMLElement {
        const dom = document.createElement('blockquote');
        dom.style.cssText = 'border-left: 4px solid #ccc; padding-left: 10px; margin-left: 0; margin-right: 0;';
        return dom;
    }

    updateDOM(prevNode: QuoteNode, dom: HTMLElement): boolean {
        return false;
    }
}

export function $isQuoteNode(node: any): boolean {
    return node instanceof QuoteNode;
}

export function $createQuoteNode(key?: string): QuoteNode {
    return new QuoteNode(key);
}
