import { Transforms, Range, Editor, Point } from "slate";

const renderDefaultElement = ({ attributes, children, element }) => {
  switch (element.type) {
    case "ELEMENT_INVISIBLE": {
      return <span {...attributes}>{children}</span>; }
    case "ELEMENT_P":{
      return <p {...attributes}>{children}</p>;
    }
    default: {
      throw new Error("Unknown tag")
    }
  }
};
const withDefault = (editor) => {
  //TODO: define default editor behavior
  const { insertBreak, isInline } = editor;
  editor.isInline = (element) => {
    switch (element.type) {
      case "ELEMENT_INVISIBLE":
        return true;
    }
    return isInline(element);
  };
  editor.insertBreak = () => {
    //check where insert break
    const selection = editor.selection;
    if (selection && Range.isCollapsed(selection)) {
      const { focus } = selection;
      const parentNodeEntry = Editor.above(editor, { at: selection });
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
export {renderDefaultElement}
