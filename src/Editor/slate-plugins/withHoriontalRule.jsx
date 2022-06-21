import { Editor, Path, Range, Transforms } from "slate";

const renderHorizontalRuleElement = ({ attributes, children, element }) => {
  switch (element.type) {
    case "ELEMENT_HORIZONTALRULE": {
      return (
        <div
          className="w-full h-1 bg-gray-300"
          {...attributes}
          contentEditable={false}
        >
          {children}
        </div>
      );
    }
    default: {
      return null;
    }
  }
};

const withHorizontalRule = (editor) => {
  const { insertBreak } = editor;
  editor.insertBreak = () => {
    const selection = editor.selection;
    if (selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const parentNodeEntry = Editor.above(editor, {
        at: anchor,
        match: (n) => Editor.isBlock(editor, n),
      });
      if (parentNodeEntry) {
        const [, path] = parentNodeEntry;
        const start = Editor.start(editor, path);
        const range = { focus: start, anchor };
        const beforeText = Editor.string(editor, range);
        const pattern = /^([\-|\*|\_])\1{2,}$/gm
        if (pattern.test(beforeText)) {
          Transforms.delete(editor, { at: range });
          Transforms.setNodes(
            editor,
            { type: "ELEMENT_HORIZONTALRULE" },
            { at: start, match: (n) => Editor.isBlock(editor, n) }
          );
          const nextPath = Path.next(path);
          Transforms.insertNodes(
            editor,
            {
              type: "ELEMENT_P",
              children: [{ text: "" }],
            },
            {
              at: nextPath,
            }
          );
          Transforms.select(editor, Editor.end(editor, nextPath));
          return;
        }
      }
    }
    insertBreak();
  };
  return editor;
};

export default withHorizontalRule;
export { renderHorizontalRuleElement };
