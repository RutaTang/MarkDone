import { Transforms, Range, Editor, Point } from "slate";

const withDefault = (editor) => {
  //TODO: define default editor behavior
  const { insertBreak } = editor;
  editor.insertBreak = () => {
    //check where insert break
    const selection = editor.selection;
    if (selection && Range.isCollapsed(selection)) {
      const { anchor, focus } = selection;
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
