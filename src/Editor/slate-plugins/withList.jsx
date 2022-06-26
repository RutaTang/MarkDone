import { Editor, Range, Transforms, Text, Point, Path } from "slate";

const renderListElement = ({ attributes, children, element }) => {
  switch (element.type) {
    case "ELEMENT_LIST_ORDERED_WRAPPER": {
      return <ol {...attributes}>{children}</ol>;
    }
    case "ELEMENT_LIST_UNORDERED_WRAPPER": {
      return <ul {...attributes}>{children}</ul>;
    }
    case "ELEMENT_LIST_ITEM": {
      return <li {...attributes}>{children}</li>;
    }
    default: {
      return null;
    }
  }
};

const createListUnorderedWrapperElement = () => {
  return { type: "ELEMENT_LIST_UNORDERED_WRAPPER" };
};
const createListItemElement = () => {
  return { type: "ELEMENT_LIST_ITEM" };
};

const withList = (editor) => {
  const { deleteBackward, insertText, insertSoftBreak, insertBreak } = editor;
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
      const isMached = /^(\*)\1*$/.test(beforeText);
      if (isMached && !Editor.isEditor(parentNodeEntry[0])) {
        const numberOfQuote = beforeText.length;
        Transforms.delete(editor, { at: range });
        for (let idx = 0; idx < numberOfQuote; idx++) {
          Transforms.wrapNodes(editor, createListUnorderedWrapperElement());
          Transforms.wrapNodes(editor, createListItemElement());
        }
        return;
      }
    }
    insertText(text);
  };
  // editor.deleteBackward = (...args) => {
  //   const { selection } = editor;
  //   if (selection && Range.isCollapsed(selection)) {
  //     const parentNodeEntry = Editor.above(editor, {
  //       match: (n) => Editor.isBlock(editor, n) && n.type == "ELEMENT_QUOTE",
  //     });
  //     if (parentNodeEntry) {
  //       const [, path] = parentNodeEntry;
  //       const start = Editor.start(editor, path);
  //       if (Point.equals(start, selection.anchor)) {
  //         Transforms.unwrapNodes(editor, {
  //           match: (n) => n.type == "ELEMENT_QUOTE",
  //         });
  //         Transforms.insertText(editor, ">", {});
  //         return;
  //       }
  //     }
  //   }
  //   deleteBackward(...args);
  // };
  // editor.insertSoftBreak = (...args) => {
  //   const { selection } = editor;
  //   if (selection && Range.isCollapsed(selection)) {
  //     const parentNodeEntry = Editor.above(editor, {
  //       match: (n) => Editor.isBlock(editor, n) && n.type == "ELEMENT_QUOTE",
  //     });
  //     if (parentNodeEntry) {
  //       const [, path] = parentNodeEntry;
  //       const end = Editor.end(editor, path);
  //       if (Point.equals(end, selection.anchor)) {
  //         insertSoftBreak(...args);
  //         Transforms.unwrapNodes(editor, {
  //           match: (n) => n.type == "ELEMENT_QUOTE",
  //           split: true,
  //         });
  //         return;
  //       }
  //     }
  //   }
  //   insertSoftBreak(...args);
  // };
  editor.insertBreak = (...args) => {
    console.log(editor.children)
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const parentNodeEntry = Editor.above(editor, {
        match: (n) =>
          Editor.isBlock(editor, n) && n.type === "ELEMENT_LIST_ITEM",
      });
      if (parentNodeEntry) {
        const [node, path] = parentNodeEntry;
        const end = Editor.end(editor, path);
        if (Point.equals(end, selection.anchor)) {
          // Transforms.unwrapNodes(editor, {
          //   split: true,
          //   match: (n) => n.type === "ELEMENT_LIST_ITEM",
          // });
          // const nextPath = Path.next(path);
          // Transforms.insertNodes(
          //   editor,
          //   { ...createListItemElement(), children: [{ text: "test" }] },
          //   {
          //     at: nextPath,
          //   }
          // );
          return;
        }
      }
    }
    insertBreak(...args);
  };
  return editor;
};

export default withList;
export { renderListElement };
