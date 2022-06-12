import { useEffect, useRef, useState } from "react";

function App() {
  const [editable, setEditable] = useState(false);
  const [editbutton, setEdiButton] = useState(false);
  const savedRef = useRef(false);
  const folderPathRef = useRef();
  const inputRef = useRef();
  const fileNameRef = useRef("Unnamed");
  //save file with Path and Content
  const saveFile = (fullPath, content) => {
    savedRef.current = true;
    electronAPI.onSave({
      path: fullPath,
      data: content,
    });
  };
  //save file with opening dialog to select folder
  const saveFileWithSelectFolder = () => {
    electronAPI.selectDir().then((r) => {
      if (r.canceled) {
        return;
      }
      const folderPath = r.filePaths[0];
      folderPathRef.current = folderPath;
      const fullPath = electronAPI.pathJoin(
        folderPathRef.current,
        fileNameRef.current + ".md"
      );
      saveFile(fullPath, "data");
    });
  };
  useEffect(() => {
    electronAPI.handleOnSave(() => {
      if (!folderPathRef.current) {
        saveFileWithSelectFolder();
      } else {
        const fullPath = electronAPI.pathJoin(
          folderPathRef.current,
          fileNameRef.current + ".md"
        );
        saveFile(fullPath, "data");
      }
    });
  }, [editable]);
  useEffect(() => {
    const f = () => {
      setEditable(false);
    };
    window.addEventListener("click", f);
    return () => window.removeEventListener("click", f);
  }, []);
  return (
    <div>
      {/* titlebar  */}
      <div
        className="w-screen h-10 titlebar flex justify-center items-center"
        onMouseEnter={() => {
          setEdiButton(true);
        }}
        onMouseLeave={() => {
          setEdiButton(false);
        }}
      >
        {editable ? (
          <input
            className="text-center outline-transparent bg-gray-200 rounded-lg py-[1px] px-[2px]"
            type="text"
            ref={inputRef}
            autoFocus
            onKeyDown={(e) => {
              if (e.code === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                // if input value is empty, do nothing
                if (!inputRef.current.value) {
                  setEditable(false);
                  return;
                }
                // if never saved before, do not write to dist but just update the name
                if (!savedRef.current) {
                  // setFileName(inputRef.current.value);
                  fileNameRef.current = inputRef.current.value;
                  setEditable(false);
                  return;
                }
                // if has been saved before, rename the file or create new one
                else {
                  electronAPI
                    .onRenameFile(
                      folderPathRef.current,
                      fileNameRef.current,
                      inputRef.current.value
                    )
                    .then((status) => {
                      if (status) {
                        // setFileName(inputRef.current.value);
                        fileNameRef.current = inputRef.current.value;
                        setEditable(false);
                      } else {
                        setEditable(false);
                      }
                    });
                }
              }
            }}
          />
        ) : (
          <div className="flex items-center space-x-2">
            <h1
              className="ignore-mouse-events"
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                saveFileWithSelectFolder();
              }}
            >
              {fileNameRef.current}
            </h1>
            {editbutton && (
              <p
                onClick={(e) => {
                  e.stopPropagation();
                  setEditable(true);
                }}
                className="text-gray-500"
              >
                Edit
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
