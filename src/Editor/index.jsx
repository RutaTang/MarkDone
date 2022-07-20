import { createEditor, Transforms, Editor } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { useEffect, useRef, useCallback } from "react";
import withHeading, {
  renderHeadingElement,
  onKeyDown as onKeyDownForHeading,
} from "./slate-plugins/withHeading";
import withQuote, { renderQuoteElement } from "./slate-plugins/withQuote";
import withHorizontalRule, {
  renderHorizontalRuleElement,
} from "./slate-plugins/withHoriontalRule";
import withLink, { renderLinkElement } from "./slate-plugins/withLink";
import withImage, { renderImageElement } from "./slate-plugins/withImage";
import withDefault, { renderDefaultElement } from "./slate-plugins/withDefault";
import withBold, { renderBoldElement } from "./slate-plugins/withBold";
import withItalic, { renderItalicElement } from "./slate-plugins/withItalic";
import withUnorderedList, {
  renderUnorderedList,
} from "./slate-plugins/withUnorderedList";
import withListItem, { renderListItem } from "./slate-plugins/withListItem";

const initialValue = [
  {
    type: "ELEMENT_P",
    children: [
      {
        text: "",
      },
    ],
  },
];

const MKEditor = () => {
  const editorRef = useRef(
    withListItem(
      withUnorderedList(
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
      renderUnorderedList(props) ||
      renderListItem(props) ||
      renderDefaultElement(props)
    );
  }, []);
  const onKeyDownHanlder = useCallback((e) => {
    const editor = editorRef.current;
    //register keydown event for plugins
    onKeyDownForHeading(editor, e);
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
