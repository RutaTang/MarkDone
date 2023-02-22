import { ElementNode } from 'lexical';

export class HeadingNode extends ElementNode {
    __level: number;

    static getType(): string {
        return 'heading';
    }

    static clone(node: HeadingNode): HeadingNode {
        return new HeadingNode(node.__level, node.key);
    }

    constructor(level: number = 1, key?: string) {
        super(key)
        if (level < 1 || level > 6) {
            throw new Error('Heading level must be between 1 and 6');
        }
        this.__level = level;
    }

    createDOM(): HTMLElement {
        const dom = document.createElement('h' + this.__level);
        return dom;
    }

    updateDOM(prevNode: HeadingNode, dom: HTMLElement): boolean {
        return false;
    }
}

export function $isHeadingNode(node: Node): boolean {
    return node instanceof HeadingNode;
}

export function $createHeadingNode(level: number, key?: string): HeadingNode {
    return new HeadingNode(level, key);
}
