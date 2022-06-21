import { Node, Editor, Range, Transforms } from "slate";
import { ExternalLink } from "lucide-react";

const renderLinkElement = ({ attribute, children, element }) => {
  switch (element.type) {
    case "ELEMENT_LINK": {
      return (
        <a
          {...attribute}
          contentEditable={false}
          className="cursor-pointer select-none inline-flex items-center space-x-1"
          onClick={(e) => {
            e.preventDefault();
            electronAPI.openUrlInBrowser(element.url);
          }}
        >
          {children}
          <ExternalLink size={15}/>
        </a>
      );
    }
    default: {
      return null;
    }
  }
};

const withLink = (editor) => {
  const {
    onChange,
    deleteBackward,
    insertText,
    insertBreak,
    isInline,
    isVoid,
  } = editor;
  editor.isInline = (element) => {
    switch (element.type) {
      case "ELEMENT_LINK":
        return true;
    }
    return isInline(element);
  };
  editor.onChange = () => {
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
        Transforms.delete(editor, {
          at: path,
          match: (n) => n.type === "ELEMENT_LINK",
        });
        Transforms.insertText(editor, `[${node.title}](${node.url})`);
      } else {
        //if current selection is not in ELEMENT_LINK
        //check whether markdown link
        //if so, change it a tag
        const blockParentNodeEntry = Editor.above(editor, {
          at: selection,
          match: (n) => Editor.isBlock(editor, n),
        });
        if (blockParentNodeEntry) {
          const [, path] = blockParentNodeEntry;
          const start = Editor.start(editor, path);
          const end = Editor.end(editor, path);
          const range = { anchor: start, focus: end };
          const wholeString = Editor.string(editor, range);
          const pattern = /(?<!!)\[(.+?)\]\((.+?)\)/g;
          const matches = wholeString.matchAll(pattern);
          for (const match of matches) {
            const wholeMatched = match[0];
            const groupOneMatched = match[1];
            const groupTwoMatched = match[2];
            console.log(groupOneMatched);
            const startIdx = match.index;
            const range = {
              focus: {
                path: start.path,
                offset: startIdx,
              },
              anchor: {
                path: start.path,
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
                  {
                    text: "",
                  },
                ],
                { at: range.focus }
              );
            }
          }
        }
      }
    }
    onChange();
  };
  return editor;
};
export default withLink;
export { renderLinkElement };
