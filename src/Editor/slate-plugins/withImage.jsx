import { Editor, Range, Transforms, Text, Node, Path } from "slate";

const renderImageElement = ({ attributes, children, element }) => {
  switch (element.type) {
    case "ELEMENT_IMAGE": {
      return (
        <div {...attributes} className="flex justify-center items-center">
          <img className="max-w-full" src={element.url} alt={element.title} />
          {children}
        </div>
      );
    }
    default: {
      return null;
    }
  }
};

const withImage = (editor) => {
  const { onChange, isInline, insertBreak, insertText, isVoid } = editor;
  editor.isVoid = (element) => {
    switch (element.type) {
      case "ELEMENT_IMAGE":
        return true;
    }
    return isVoid(element);
  };

  editor.onChange = () => {
    onChange();
    const selection = editor.selection;
    if (selection && Range.isCollapsed(selection)) {
      const linkParentNodeEntry = Editor.above(editor, {
        at: selection,
        match: (n) => n.type === "ELEMENT_IMAGE",
      });
      if (linkParentNodeEntry) {
        // if current selection is in ELEMENT_LINK
        // transfrom link to plain text
        //
        const [node, path] = linkParentNodeEntry;
        Transforms.setNodes(
          editor,
          { type: "ELEMENT_P", children: [{ text: "" }] },
          {
            at: path,
            match: (n) => n.type === "ELEMENT_IMAGE",
          }
        );
        Transforms.insertText(editor, `![${node.title}](${node.url})`, {
          at: Editor.start(editor, path),
        });
      } else {
        //if current selection is not in ELEMENT_LINK
        //check whether markdown link
        //if so, change it a tag
        const textNodeEntries = [
          ...Editor.nodes(editor, {
            at: [],
            match: (on, path) => {
              const isText = Text.isText(on);
              const isInLinkNode = !!Editor.above(editor, {
                at: path,
                match: (n) => n.type === "ELEMENT_IMAGE",
              });
              return isText && !isInLinkNode;
            },
          }),
        ];
        for (const textNodeEntry of textNodeEntries) {
          const [textNode, path] = textNodeEntry;
          const wholeString = textNode.text;
          const pattern = /!\[(.+?)\]\((.+?)\)/g;
          const matches = wholeString.matchAll(pattern);
          for (const match of matches) {
            const wholeMatched = match[0];
            const groupOneMatched = match[1];
            const groupTwoMatched = match[2];
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
              const blockParentNodeEntry = Editor.above(editor, {
                at: range,
                match: (n) => Editor.isBlock(editor, n),
              });
              const [node,blockParentPath] = blockParentNodeEntry;
              if (Editor.isEmpty(editor, node)) {
                Transforms.setNodes(
                  editor,
                  {
                    type: "ELEMENT_IMAGE",
                    title: groupOneMatched,
                    url: groupTwoMatched,
                    children: [{ text: "" }],
                  },
                  { at: range.focus, match: (n) => Editor.isBlock(editor, n) }
                );
              } else {
                const atLocation = Path.next(blockParentPath)
                Transforms.insertNodes(
                  editor,
                  {
                    type: "ELEMENT_IMAGE",
                    title: groupOneMatched,
                    url: groupTwoMatched,
                    children: [{ text: "" }],
                  },
                  { at: atLocation  }
                );
              }
            }
          }
        }
      }
    }
  };
  return editor;
};
export default withImage;
export { renderImageElement };
