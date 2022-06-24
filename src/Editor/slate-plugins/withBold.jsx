import { Editor, Range, Transforms, Text } from "slate";

const renderBoldElement = ({ attributes, children, element }) => {
  switch (element.type) {
    case "ELEMENT_BOLD": {
      return <strong {...attributes}>{children}</strong>;
    }
    default: {
      return null;
    }
  }
};

const withBold = (editor) => {
  const { onChange, isInline } = editor;
  editor.isInline = (element) => {
    switch (element.type) {
      case "ELEMENT_BOLD":
        return true;
    }
    return isInline(element);
  };
  editor.onChange = () => {
    onChange();
    const selection = editor.selection;
    if (selection && Range.isCollapsed(selection)) {
      const boldParentNodeEntry = Editor.above(editor, {
        at: selection,
        match: (n) => n.type === "ELEMENT_BOLD",
      });
      if (boldParentNodeEntry) {
        console.log(1);
        const [node, path] = boldParentNodeEntry;
        Transforms.removeNodes(editor, {
          at: path,
          match: (n) => n.type === "ELEMENT_BOLD",
        });
        Transforms.insertText(editor, `**${node.title}**`, {
          at: editor.selection,
        });
      } else {
        console.log(2);
        const textNodeEntries = [
          ...Editor.nodes(editor, {
            at: [],
            match: (on, path) => {
              const isText = Text.isText(on);
              const isInLinkNode = !!Editor.above(editor, {
                at: path,
                match: (n) => n.type === "ELEMENT_BOLD",
              });
              return isText && !isInLinkNode;
            },
          }),
        ];
        for (const textNodeEntry of textNodeEntries) {
          const [textNode, path] = textNodeEntry;
          const wholeString = textNode.text;
          const pattern = /[*]{2}(.+)[*]{2}/g;
          const matches = wholeString.matchAll(pattern);
          for (const match of matches) {
            const wholeMatched = match[0];
            const groupOneMatched = match[1];
            const startIdx = match.index;
            const range = {
              focus: {
                path: path,
                offset: startIdx,
              },
              anchor: {
                path: path,
                offset: startIdx + wholeMatched.length,
              },
            };
            if (!Range.includes(range, selection)) {
              Transforms.delete(editor, { at: range });
              Transforms.insertNodes(
                editor,
                [
                  {
                    type: "ELEMENT_BOLD",
                    title: groupOneMatched,
                    children: [{ text: groupOneMatched }],
                  },
                  {
                    type: "ELEMENT_INVISIBLE",
                    children: [{ text: "" }],
                  },
                ],
                { at: range.focus }
              );
            }
          }
        }
      }
    }
  };
  return editor;
};
export default withBold;
export { renderBoldElement };
