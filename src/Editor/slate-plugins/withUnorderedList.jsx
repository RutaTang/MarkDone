import { Editor, Path, Point, Range, Transforms } from "slate";

const renderUnorderedList = ({ attributes, children, element }) => {
  switch (element.type) {
    case "ELEMENT_UNORDERED_LIST": {
      return <ul {...attributes}>{children}</ul>;
    }
    default: {
      return null;
    }
  }
};

const withUnorderedList = (editor) => {
  const { insertText, insertBreak } = editor;
  editor.insertText = (text) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      if (text === " ") {
        //check previous character of current block to be * or -
        //if so, wrap current block with ELEMENT_LIST_ITEM, then wrap with ELEMENT_UNORDERED_LIST
        const parentBlock = Editor.above(editor, {
          match: (n) => Editor.isBlock(editor, n),
        });
        const start = Editor.start(editor, parentBlock ? parentBlock[1] : []);
        const range = { anchor: start, focus: selection.focus };
        const previousCharacter = Editor.string(editor, range);
        if (previousCharacter === "*" || previousCharacter === "-") {
          Transforms.delete(editor, { at: range });
          const listItem = { type: "ELEMENT_LIST_ITEM" };
          const unorderedList = {
            type: "ELEMENT_UNORDERED_LIST",
          };
          Transforms.wrapNodes(editor, listItem, {
            at: parentBlock[1],
          });
          Transforms.wrapNodes(editor, unorderedList, {
            at: parentBlock[1],
          });
          return;
        }
      }
    }
    insertText(text);
  };
  editor.insertBreak = () => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const parentBlock = Editor.above(editor, {
        match: (n) =>
          Editor.isBlock(editor, n) && n.type === "ELEMENT_LIST_ITEM",
      });
      if (parentBlock) {
        const end = Editor.end(editor, parentBlock[1]);
        if (Point.equals(end, selection.focus)) {
          const listItem = { type: "ELEMENT_LIST_ITEM", children: [] };
          const instertPath = Path.next(parentBlock[1]);
          Transforms.insertNodes(editor, listItem, {
            at: instertPath,
          });
          Transforms.select(editor, Editor.end(editor, instertPath));
          return;
        }
        return;
      }
    }
    insertBreak();
  };
  return editor;
};

export default withUnorderedList;
export { renderUnorderedList };
