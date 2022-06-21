const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");

contextBridge.exposeInMainWorld("electronAPI", {
  console: () => ipcRenderer.invoke("console", "new message"),
  selectDir: () => ipcRenderer.invoke("selectDir"),
  handleOnSave: (callback) => ipcRenderer.on("save", callback),
  onSave: (data) => ipcRenderer.send("onSave", data),
  pathJoin: (...paths) => path.join(...paths),
  onRenameFile: (folderPath, previousFileName, currentFileName) =>
    ipcRenderer.invoke(
      "onRenameFile",
      folderPath,
      previousFileName,
      currentFileName
    ),
  openUrlInBrowser: (url) => {
    ipcRenderer.send("openUrlInBrowser", url);
  },
});
