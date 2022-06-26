import { Editor, Range, Transforms, Text } from "slate";
import { ExternalLink } from "lucide-react";

const renderLinkElement = ({ attributes, children, element }) => {
  switch (element.type) {
    case "ELEMENT_LINK": {
      return (
        <a
          {...attributes}
          contentEditable={false}
          className="cursor-pointer select-none inline-flex items-center space-x-1"
          onClick={(e) => {
            e.preventDefault();
            electronAPI.openUrlInBrowser(element.url);
          }}
        >
          {children}
          <ExternalLink size={15} />
        </a>
      );
    }
    default: {
      return null;
    }
  }
};

const withLink = (editor) => {
  const { onChange, isInline } = editor;
  editor.isInline = (element) => {
    switch (element.type) {
      case "ELEMENT_LINK":
        return true;
    }
    return isInline(element);
  };
  editor.onChange = () => {
    onChange();
    const selection = editor.selection;
    if (selection && Range.isCollapsed(selection)) {
      const linkParentNodeEntry = Editor.above(editor, {
        at: selection,
        match: (n) => n.type === "ELEMENT_LINK",
      });
      if (linkParentNodeEntry) {
        // if current selection is in ELEMENT_LINK
        // transfrom link to plain text
        //
        const [node, path] = linkParentNodeEntry;
        Transforms.setNodes(editor,{type:"ELEMENT_INLINE_TEXT"}, {
          at: path,
          match: (n) => n.type === "ELEMENT_LINK",
        });
        Transforms.insertText(editor, `[${node.title}](${node.url})`, {
          at: path,
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
                match: (n) => n.type === "ELEMENT_LINK",
              });
              return isText && !isInLinkNode;
            },
          }),
        ];
        for (const textNodeEntry of textNodeEntries) {
          const [textNode, path] = textNodeEntry;
          const wholeString = textNode.text;
          const pattern = /(?<!!)\[(.+?)\]\((.+?)\)/g;
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
              Transforms.insertNodes(
                editor,
                [
                  {
                    type: "ELEMENT_LINK",
                    title: groupOneMatched,
                    url: groupTwoMatched,
                    children: [{ text: groupOneMatched }],
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
export default withLink;
export { renderLinkElement };
