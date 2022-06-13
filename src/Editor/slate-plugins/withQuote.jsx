import { Editor, Path, Point, Range, Transforms } from "slate";

const VALUE_TO_TYPE = new Map([[">", "ELEMENT_QUOTE"]]);
const TYPE_TO_VALUE = new Map(
  Array.from(VALUE_TO_TYPE).map((item) => [...item.reverse()])
);

const createQuoteElement = () => {
  return { type: "ELEMENT_QUOTE" };
};
const renderQuoteElement = ({ attributes, children, element }) => {
  switch (element.type) {
    case "ELEMENT_QUOTE": {
      return <blockquote {...attributes}>{children}</blockquote>;
    }
    default: {
      return null;
    }
  }
};

const withQuote = (editor) => {
  const { deleteBackward, insertText, insertSoftBreak,insertBreak } = editor;
  editor.insertText = (text) => {
    const { selection } = editor;
    if (text === " " && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const parentNodeEntry = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      const start = Editor.start(
        editor,
        parentNodeEntry ? parentNodeEntry[1] : []
      );
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);
      const isMached = /^(>)\1*$/.test(beforeText);
      if (isMached && !Editor.isEditor(parentNodeEntry[0])) {
        const numberOfQuote = beforeText.length;
        Transforms.delete(editor, { at: range });
        for (let idx = 0; idx < numberOfQuote; idx++) {
          Transforms.wrapNodes(editor, createQuoteElement());
        }
        return;
      }
    }
    insertText(text);
  };
  editor.deleteBackward = (...args) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const parentNodeEntry = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n) && n.type == "ELEMENT_QUOTE",
      });
      if (parentNodeEntry) {
        const [, path] = parentNodeEntry;
        const start = Editor.start(editor, path);
        if (Point.equals(start, selection.anchor)) {
          Transforms.unwrapNodes(editor, {
            match: (n) => n.type == "ELEMENT_QUOTE",
          });
          Transforms.insertText(editor, ">", {});
          return;
        }
      }
    }
    deleteBackward(...args);
  };
  editor.insertSoftBreak = (...args) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const parentNodeEntry = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n) && n.type == "ELEMENT_QUOTE",
      });
      if (parentNodeEntry) {
        const [, path] = parentNodeEntry;
        const end = Editor.end(editor, path);
        if (Point.equals(end, selection.anchor)) {
          insertSoftBreak(...args);
          Transforms.unwrapNodes(editor, {
            match: (n) => n.type == "ELEMENT_QUOTE",
            split: true,
          });
          return;
        }
      }
    }
    console.log("QUOT")
    insertSoftBreak(...args);
  };
  return editor;
};

export default withQuote;
export { renderQuoteElement };
