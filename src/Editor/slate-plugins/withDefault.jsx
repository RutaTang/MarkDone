import { Transforms, Range, Editor, Point, Text } from "slate";

const renderDefaultElement = ({ attributes, children, element }) => {
  switch (element.type) {
    case "ELEMENT_P": {
      return <p {...attributes}>{children}</p>;
    }
    case "ELEMENT_INLINE_TEXT":{
      return <span {...attributes}>{children}</span>
    }
    default: {
      throw new Error("Unknown tag");
    }
  }
};
const withDefault = (editor) => {
  //TODO: define default editor behavior
  const { insertBreak, isInline } = editor;
  editor.isInline = (element) => {
    switch (element.type) {
      case "ELEMENT_INLINE_TEXT":
        return true;
    }
    return isInline(element);
  };
  editor.insertBreak = () => {
    //check where insert break
    // console.log([...Editor.nodes(editor, { at: [], match: (n) => Text.isText(n) })]);
    const selection = editor.selection;
    if (selection && Range.isCollapsed(selection)) {
      const { focus } = selection;
      const parentNodeEntry = Editor.above(editor, {
        at: selection,
        match: (n) => Editor.isBlock(editor, n),
      });
      if (parentNodeEntry) {
        const [, path] = parentNodeEntry;
        const end = Editor.end(editor, path);
        if (Point.equals(end, focus)) {
          Transforms.insertNodes(editor, {
            type: "ELEMENT_P",
            children: [{ text: "" }],
          });
          return;
        }
      }
    }
    insertBreak();
  };
  return editor;
};

export default withDefault;
export { renderDefaultElement };
