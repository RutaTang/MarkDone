import { Editor, Range, Transforms, Text, Point, Path, Element } from "slate";
import { Circle } from "lucide-react";

const renderListElement = ({ attributes, children, element }) => {
  switch (element.type) {
    case "ELEMENT_LIST_ORDERED_WRAPPER": {
      return (
        <ol
          {...attributes}
          style={{
            marginLeft: `${Number(element.level)}rem`,
          }}
        >
          {children.map((child, idx) => {
            const isIncludNewWrapperInChildren = element.children[
              idx
            ].children.some(
              (item) =>
                item.type === "ELEMENT_LIST_ORDERED_WRAPPER" ||
                item.type === "ELEMENT_LIST_UNORDERED_WRAPPER"
            );
            return (
              <li key={idx} className="flex items-start">
                {/* {isIncludNewWrapperInChildren ? null : ( */}
                <span className="mr-2">{`${idx + 1}.`}</span>
                {/* )} */}
                {child}
              </li>
            );
          })}
        </ol>
      );
    }
    case "ELEMENT_LIST_UNORDERED_WRAPPER": {
      return (
        <ul
          {...attributes}
          style={{
            marginLeft: `${Number(element.level)}rem`,
          }}
        >
          {children.map((child, idx) => {
            const isIncludNewWrapperInChildren = element.children[
              idx
            ].children.some(
              (item) =>
                item.type === "ELEMENT_LIST_ORDERED_WRAPPER" ||
                item.type === "ELEMENT_LIST_UNORDERED_WRAPPER"
            );
            return (
              <li key={idx} className="flex items-start">
                {/* {isIncludNewWrapperInChildren ? null : ( */}
                <Circle className="mr-2" size="0.8rem" />
                {/* )} */}
                {child}
              </li>
            );
          })}
        </ul>
      );
    }
    case "ELEMENT_LIST_ITEM": {
      return <div {...attributes}>{children}</div>;
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
const createListOrderedWrapperElement = ({ level }) => {
  return {
    type: "ELEMENT_LIST_ORDERED_WRAPPER",
    level,
  };
};
const createListItemElement = () => {
  return { type: "ELEMENT_LIST_ITEM" };
};

const withList = (editor) => {
  const { insertText, insertBreak } = editor;

  editor.insertText = (text) => {
    //TODO: insert err
    const { selection } = editor;
    if (text === " " && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const parentNodeEntry = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      const parentLisNodeEntry = Editor.above(editor, {
        match: (n) =>
          n.type == "ELEMENT_LIST_UNORDERED_WRAPPER" ||
          n.type == "ELEMENT_LIST_ORDERED_WRAPPER",
      });
      const parentListItemNodeEntry = Editor.above(editor, {
        match: (n) => n.type == "ELEMENT_LIST_ITEM",
      });

      if (parentNodeEntry) {
        const [node, path] = parentNodeEntry;
        const start = Editor.start(editor, path);
        const range = { anchor, focus: start };
        const beforeText = Editor.string(editor, range);
        const isMachedUnOrdered = /^(\*)\1*$/.test(beforeText);
        const isMachedOrdered = /^(\d\.)\1*$/.test(beforeText);
        if ((isMachedOrdered || isMachedUnOrdered) && !Editor.isEditor(node)) {
          const numberOfQuote = isMachedUnOrdered
            ? beforeText.length
            : beforeText.length / 2;
          Transforms.delete(editor, { at: range });
          for (let idx = 0; idx < numberOfQuote; idx++) {
            let level = idx;
            if (parentLisNodeEntry && parentListItemNodeEntry) {
              level = parentLisNodeEntry[0].level + idx + 1;
            }
            let listWrapper = null;
            if (isMachedUnOrdered) {
              listWrapper = createListUnorderedWrapperElement({ level: level });
            }
            if (isMachedOrdered) {
              listWrapper = createListOrderedWrapperElement({ level: level });
            }
            Transforms.wrapNodes(editor, listWrapper);
            Transforms.wrapNodes(editor, createListItemElement());
          }
          return;
        }
      }
    }
    insertText(text);
  };
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
          Transforms.wrapNodes(editor, createListItemElement());
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
              match: (n) =>
                n.type === "ELEMENT_LIST_UNORDERED_WRAPPER" ||
                n.type === "ELEMENT_LIST_ORDERED_WRAPPER",
              mode: "all",
            }),
          ];
          if (ancestentListUnorderedWrapper.length > 1) {
            Transforms.unwrapNodes(editor, {
              split: true,
              match: (n) =>
                n.type === "ELEMENT_LIST_UNORDERED_WRAPPER" ||
                n.type === "ELEMENT_LIST_ORDERED_WRAPPER",
            });
            Transforms.liftNodes(editor, {
              split: true,
              match: (n) => n.type === "ELEMENT_LIST_ITEM",
            });
          } else {
            Transforms.unwrapNodes(editor, {
              split: true,
              match: (n) =>
                n.type === "ELEMENT_LIST_UNORDERED_WRAPPER" ||
                n.type === "ELEMENT_LIST_ORDERED_WRAPPER",
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
      const listWrapperNodeEntry = Editor.above(editor, {
        match: (n) =>
          n.type === "ELEMENT_LIST_UNORDERED_WRAPPER" ||
          n.type === "ELEMENT_LIST_ORDERED_WRAPPER",
      });
      if (!(listItemNodeEntry && listWrapperNodeEntry)) {
        return;
      }
      const lisItemIdx = listWrapperNodeEntry[0].children.findIndex(
        (item) => item === listItemNodeEntry[0]
      );
      if (lisItemIdx <= 0) {
        return;
      }
      //move ul to previous li
      const destination = [
        ...Path.previous(listItemNodeEntry[1]),
        listWrapperNodeEntry[0].children[lisItemIdx - 1].children.length,
      ];
      Transforms.moveNodes(editor, {
        to: destination,
        at: listItemNodeEntry[1],
      });
      let wrapper = null;
      if (listWrapperNodeEntry[0].type === "ELEMENT_LIST_ORDERED_WRAPPER") {
        wrapper = createListOrderedWrapperElement({
          level: listWrapperNodeEntry.level + 1,
        });
      }
      if (listWrapperNodeEntry[0].type === "ELEMENT_LIST_UNORDERED_WRAPPER") {
        wrapper = createListUnorderedWrapperElement({
          level: listWrapperNodeEntry.level + 1,
        });
      }
      Transforms.wrapNodes(editor, wrapper, {
        at: destination,
      });
    }
  }
  return;
};

export default withList;
export { renderListElement, onKeyDown };
