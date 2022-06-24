import { Editor, Range, Transforms, Text } from "slate";

const renderItalicElement = ({ attributes, children, element }) => {
  switch (element.type) {
    case "ELEMENT_ITALIC": {
      return <em {...attributes}>{children}</em>;
    }
    default: {
      return null;
    }
  }
};

const withItalic = (editor) => {
  const { onChange, isInline } = editor;
  editor.isInline = (element) => {
    switch (element.type) {
      case "ELEMENT_ITALIC":
        return true;
    }
    return isInline(element);
  };
  editor.onChange = () => {
    onChange();
    const selection = editor.selection;
    if (selection && Range.isCollapsed(selection)) {
      const italicParentNodeEntry = Editor.above(editor, {
        at: selection,
        match: (n) => n.type === "ELEMENT_ITALIC",
      });
      if (italicParentNodeEntry) {
        const [node, path] = italicParentNodeEntry;
        Transforms.removeNodes(editor, {
          at: path,
          match: (n) => n.type === "ELEMENT_ITALIC",
        });
        Transforms.insertText(editor, `*${node.title}*`, {
          at: editor.selection,
        });
      } else {
        const textNodeEntries = [
          ...Editor.nodes(editor, {
            at: [],
            match: (on, path) => {
              const isText = Text.isText(on);
              const isInLinkNode = !!Editor.above(editor, {
                at: path,
                match: (n) => n.type === "ELEMENT_ITALIC",
              });
              return isText && !isInLinkNode;
            },
          }),
        ];
        for (const textNodeEntry of textNodeEntries) {
          const [textNode, path] = textNodeEntry;
          const wholeString = textNode.text;
          const pattern = /(?<!\*)[*]{1}(?!\s)(.+)(?!<\s)[*]{1}(?!\*)/g;
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
                    type: "ELEMENT_ITALIC",
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
export default withItalic;
export { renderItalicElement };
