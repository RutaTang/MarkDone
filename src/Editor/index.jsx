import { createEditor, Transforms, Editor } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { useEffect, useRef, useCallback } from "react";
import withHeading, { renderHeadingElement } from "./slate-plugins/withHeading";
import withQuote, { renderQuoteElement } from "./slate-plugins/withQuote";
import withHorizontalRule, {
  renderHorizontalRuleElement,
} from "./slate-plugins/withHoriontalRule";
import withLink, { renderLinkElement } from "./slate-plugins/withLink";
import withImage, { renderImageElement } from "./slate-plugins/withImage";
import withDefault, { renderDefaultElement } from "./slate-plugins/withDefault";
import withBold, { renderBoldElement } from "./slate-plugins/withBold";
import withItalic, { renderItalicElement } from "./slate-plugins/withItalic";
import withList, { renderListElement } from "./slate-plugins/withList";

const initialValue = [
  {
    type: "ELEMENT_P",
    children: [
      {
        text:""
      },
    ],
  },
];

const MKEditor = () => {
  const editorRef = useRef(
    withList(
      withImage(
        withItalic(
          withBold(
            withLink(
              withHorizontalRule(
                withQuote(withHeading(withDefault(withReact(createEditor()))))
              )
            )
          )
        )
      )
    )
  );
  const renderElement = useCallback((props) => {
    return (
      renderHeadingElement(props) ||
      renderQuoteElement(props) ||
      renderHorizontalRuleElement(props) ||
      renderLinkElement(props) ||
      renderBoldElement(props) ||
      renderItalicElement(props) ||
      renderImageElement(props) ||
      renderListElement(props) ||
      renderDefaultElement(props)
    );
  }, []);
  const onKeyDownHanlder = useCallback((e) => {
    if (e.ctrlKey && e.altKey && e.code == "Backquote") {
      e.preventDefault();
      const editor = editorRef.current;
      Transforms.insertNodes(
        editor,
        { type: "ELEMENT_H1", children: [] },
        {
          at: [editor.children.length],
        }
      );
      Transforms.select(editor, [editor.children.length - 1]);
    }
  });
  useEffect(() => {
    ReactEditor.focus(editorRef.current);
    Transforms.select(editorRef.current, Editor.end(editorRef.current, []));
  }, []);
  return (
    <>
      <Slate editor={editorRef.current} value={initialValue}>
        <div className="w-4/5 mx-auto px-2 py-3 mt-10 markdown">
          <Editable
            renderElement={renderElement}
            onKeyDown={onKeyDownHanlder}
          />
        </div>
      </Slate>
    </>
  );
};

export default MKEditor;
