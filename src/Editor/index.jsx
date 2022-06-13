import { createEditor, Transforms, Editor } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { useEffect, useRef, useCallback } from "react";
import withHeading, { renderHeadingElement } from "./slate-plugins/withHeading";
import withQuote, { renderQuoteElement } from "./slate-plugins/withQuote";

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

const renderDefaultElement = ({ attributes, children }) => {
  return <p {...attributes}>{children}</p>;
};

const MKEditor = () => {
  const editorRef = useRef(withQuote(withHeading(withReact(createEditor()))));
  const renderElement = useCallback((props) => {
    return (
      renderHeadingElement(props) ||
      renderQuoteElement(props) ||
      renderDefaultElement(props)
    );
  }, []);
  const onKeyDownHanlder = useCallback((e) => {
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
