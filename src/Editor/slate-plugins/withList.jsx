import { Editor, Range, Transforms, Text, Point, Path, Element } from "slate";
import { Circle } from "lucide-react";

//TODO: add ordered list feature
const renderListElement = ({ attributes, children, element }) => {
  switch (element.type) {
    case "ELEMENT_LIST_ORDERED_WRAPPER": {
      return <ol {...attributes}>{children}</ol>;
    }
    case "ELEMENT_LIST_UNORDERED_WRAPPER": {
      return (
        <ul
          {...attributes}
          style={{
            marginLeft: `${Number(element.level)}rem`,
          }}
        >
          {children}
        </ul>
      );
    }
    case "ELEMENT_LIST_ITEM": {
      const { showListItemIcon } = element;
      return (
        <li {...attributes} className="flex items-center">
          <div contentEditable={false}>
            {showListItemIcon ? <Circle size="0.6rem" /> : ""}
          </div>
          <div className="ml-2">{children}</div>
        </li>
      );
    }
    default: {
      return null;
    }
  }
};

const createListUnorderedWrapperElement = ({ level }) => {
  return {
    type: "ELEMENT_LIST_UNORDERED_WRAPPER",
    level,
  };
};
const createListItemElement = ({ showListItemIcon }) => {
  return { type: "ELEMENT_LIST_ITEM", showListItemIcon };
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
      const parentLisNodeEntry = Editor.above(editor, {
        match: (n) => n.type == "ELEMENT_LIST_UNORDERED_WRAPPER",
      });
      const parentListItemNodeEntry = Editor.above(editor, {
        match: (n) => n.type == "ELEMENT_LIST_ITEM",
      });

      if (parentNodeEntry) {
        const [node, path] = parentNodeEntry;
        const start = Editor.start(editor, path);
        const range = { anchor, focus: start };
        const beforeText = Editor.string(editor, range);
        const isMached = /^(\*)\1*$/.test(beforeText);
        if (isMached && !Editor.isEditor(node)) {
          const numberOfQuote = beforeText.length;
          Transforms.delete(editor, { at: range });
          for (let idx = 0; idx < numberOfQuote; idx++) {
            let level = idx;
            if (parentLisNodeEntry && parentListItemNodeEntry) {
              level = parentLisNodeEntry[0].level + idx + 1;
              Transforms.setNodes(
                editor,
                { showListItemIcon: false },
                {
                  at: parentListItemNodeEntry[1],
                }
              );
            }
            Transforms.wrapNodes(
              editor,
              createListUnorderedWrapperElement({ level: level })
            );
            Transforms.wrapNodes(
              editor,
              createListItemElement({ showListItemIcon: true })
            );
          }
          return;
        }
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
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const parentNodeEntry = Editor.above(editor, {
        match: (n) =>
          Editor.isBlock(editor, n) && n.type === "ELEMENT_LIST_ITEM",
      });
      if (parentNodeEntry) {
        const [, path] = parentNodeEntry;
        const end = Editor.end(editor, path);
        if (Point.equals(end, selection.anchor)) {
          insertBreak(...args);
          Transforms.unwrapNodes(editor, {
            split: true,
            match: (n) => n.type === "ELEMENT_LIST_ITEM",
          });
          Transforms.wrapNodes(
            editor,
            createListItemElement({ showListItemIcon: true })
          );
          return;
        }
      }
    }
    insertBreak(...args);
  };
  return editor;
};

const onKeyDown = (editor, e) => {
  if (e.code == "Tab" && e.shiftKey) {
    e.preventDefault();
    const selection = editor.selection;
    if (selection && Range.isCollapsed(selection)) {
      const listItemNodeEntry = Editor.above(editor, {
        at: selection,
        match: (n) => n.type === "ELEMENT_LIST_ITEM",
      });
      if (listItemNodeEntry) {
        const listItemRange = Editor.range(editor, listItemNodeEntry[1]);
        const isSelectionInListItemRange = Range.includes(
          listItemRange,
          selection
        );
        if (isSelectionInListItemRange) {
          const ancestentListUnorderedWrapper = [
            ...Editor.nodes(editor, {
              match: (n) => n.type === "ELEMENT_LIST_UNORDERED_WRAPPER",
              mode: "all",
            }),
          ];
          if (ancestentListUnorderedWrapper.length > 1) {
            Transforms.unwrapNodes(editor, {
              split: true,
              match: (n) => n.type === "ELEMENT_LIST_UNORDERED_WRAPPER",
            });
            Transforms.liftNodes(editor, {
              split: true,
              match: (n) => n.type === "ELEMENT_LIST_ITEM",
            });
          } else {
            Transforms.unwrapNodes(editor, {
              split: true,
              match: (n) => n.type === "ELEMENT_LIST_UNORDERED_WRAPPER",
            });
            Transforms.unwrapNodes(editor, {
              split: true,
              match: (n) => n.type === "ELEMENT_LIST_ITEM",
            });
          }
        }
      }
    }
    return;
  }
  if (e.code == "Tab") {
    e.preventDefault();
    const selection = editor.selection;
    if (selection && Range.isCollapsed(selection)) {
      const listItemNodeEntry = Editor.above(editor, {
        at: selection,
        match: (n) => n.type === "ELEMENT_LIST_ITEM",
      });
      if (listItemNodeEntry) {
        const listItemRange = Editor.range(editor, listItemNodeEntry[1]);
        const isSelectionInListItemRange = Range.includes(
          listItemRange,
          selection
        );
        if (isSelectionInListItemRange) {
          const listWrapperNodeEntry = Editor.above(editor, {
            match: (n) => n.type === "ELEMENT_LIST_UNORDERED_WRAPPER",
          });
          Transforms.wrapNodes(
            editor,
            createListUnorderedWrapperElement({
              level: listWrapperNodeEntry[0].level + 1,
            }),
            {
              at: listItemNodeEntry[1],
            }
          );
          Transforms.wrapNodes(
            editor,
            createListItemElement({ showListItemIcon: false }),
            {
              at: Editor.above(editor, {
                match: (n) => n.type === "ELEMENT_LIST_UNORDERED_WRAPPER",
              })[1],
            }
          );
        }
      }
    }
  }
  return;
};

export default withList;
export { renderListElement, onKeyDown };
