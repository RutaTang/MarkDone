import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { DefaultPlugin } from './plugins/DefaultPlugin';
import { TravalTreeViewPlugin } from './plugins/TravalTreeViewPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode } from './nodes/HeadingNode';
import { HeadingPlugin } from './plugins/HeadingPlugin';
import { QuotePlugin } from './plugins/QuotePlugin';
import { QuoteNode } from './nodes/QuoteNode';

function Editor() {
    const initialConfig = {
        namespace: 'MyEditor',
        onError: console.error,
        nodes: [
            HeadingNode, QuoteNode
        ]
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <PlainTextPlugin
                contentEditable={<ContentEditable style={{ width: "100%", minHeight: "100px", padding: "10px" }} />}
                placeholder={null}
                ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangePlugin onChange={console.log} />
            <DefaultPlugin />
            <TravalTreeViewPlugin />
            <HeadingPlugin />
            <QuotePlugin />
        </LexicalComposer>
    );
}


export { Editor }
