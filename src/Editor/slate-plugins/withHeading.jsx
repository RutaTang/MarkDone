import { Editor, Range, Transforms, Element, Point } from "slate";

const VALUE_TO_TYPE = new Map([
  ["#", "ELEMENT_H1"],
  ["##", "ELEMENT_H2"],
  ["###", "ELEMENT_H3"],
  ["####", "ELEMENT_H4"],
  ["#####", "ELEMENT_H5"],
  ["######", "ELEMENT_H6"],
]);
const TYPE_TO_VALUE = new Map(
  Array.from(VALUE_TO_TYPE).map((item) => [...item.reverse()])
);

const isHeadingElement = (element) => {
  return !!TYPE_TO_VALUE.get(element.type);
};

const renderHeadingElement = ({ attributes, children, element }) => {
  switch (element.type) {
    case "ELEMENT_H1": {
      return <h1 {...attributes}>{children}</h1>;
    }
    case "ELEMENT_H2": {
      return <h2 {...attributes}>{children}</h2>;
    }
    case "ELEMENT_H3": {
      return <h3 {...attributes}>{children}</h3>;
    }
    case "ELEMENT_H4": {
      return <h4 {...attributes}>{children}</h4>;
    }
    case "ELEMENT_H5": {
      return <h5 {...attributes}>{children}</h5>;
    }
    case "ELEMENT_H6": {
      return <h6 {...attributes}>{children}</h6>;
    }
    default: {
      return null;
    }
  }
};

const createHeadingElement = (shortcutvalue) => {
  return { type: shortcutvalue };
};

const withHeading = (editor) => {
  const { deleteBackward, insertText, insertSoftBreak, insertBreak } = editor;
  editor.insertText = (text) => {
    const { selection } = editor;
    if (text == " " && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const parentBlock = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      const start = Editor.start(editor, parentBlock ? parentBlock[1] : []);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);
      const type = VALUE_TO_TYPE.get(beforeText);
      if (type) {
        console.log(type);
        Transforms.delete(editor, {
          at: range,
        });
        Transforms.setNodes(editor, createHeadingElement(type), {
          match: (n) => Editor.isBlock(editor, n),
        });
        return;
      }
    }
    insertText(text);
  };
  editor.deleteBackward = (...args) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const parentBlock = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      if (parentBlock) {
        const [block, path] = parentBlock;
        const start = Editor.start(editor, path);
        if (
          !Editor.isEditor(block) &&
          Element.isElement(block) &&
          isHeadingElement(block) &&
          Point.equals(selection.anchor, start)
        ) {
          Transforms.setNodes(editor, { type: "ELEMENT_P" });
          Transforms.insertText(editor, TYPE_TO_VALUE.get(block.type));
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
        match: (n) => Editor.isBlock(editor, n) && isHeadingElement(n),
      });
      if (parentNodeEntry) {
        const [, path] = parentNodeEntry;
        const end = Editor.end(editor, path);
        if (Point.equals(end, selection.anchor)) {
          insertSoftBreak(...args);
          Transforms.setNodes(editor, { type: "ELEMENT_P" });
          return;
        }
      }
    }
    insertSoftBreak(...args);
  };
  return editor;
};

export default withHeading;
export { renderHeadingElement };
