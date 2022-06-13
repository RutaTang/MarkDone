const {
  dialog,
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
} = require("electron");
const path = require("path");
const fs = require("fs");

const createWindow = () => {
  const win = new BrowserWindow({
    // titleBarStyle: "customButtonsOnHover",
    titleBarStyle: "hidden",
    titleBarOverlay: true,
    width: 800,
    height: 600,
    webPreferences: {
      preload: `${__dirname}/preload.js`,
      spellcheck: false,
    },
  });
  win.loadURL("http://localhost:3000");
  return win;
};

app.whenReady().then(() => {
  const win = createWindow();
  globalShortcut.register("CommandOrControl+S", () => {
    win.webContents.send("save");
  });
  ipcMain.handle("console", (e, line) => {
    const files = fs.readdirSync("./");
    return files;
  });
  ipcMain.handle("selectDir", async (e) => {
    return await dialog.showOpenDialog(win, { properties: ["openDirectory"] });
  });
  ipcMain.handle(
    "onRenameFile",
    (e, folderPath, previousFileName, currentFileName) => {
      const previousFilePath = previousFileName + ".md";
      const currentFilePath = currentFileName + ".md";
      const pFullPath = path.join(folderPath, previousFilePath);
      const cFullPath = path.join(folderPath, currentFilePath);
      const btnID = dialog.showMessageBoxSync(win, {
        message: "Rename or create a new file?",
        title: "Rename File",
        buttons: ["create a new file", "rename", "cancel"],
        cancelId: 2,
        defaultId: 0,
      });
      switch (btnID) {
        case 0: {
          fs.copyFileSync(pFullPath, cFullPath, fs.constants.COPYFILE_EXCL);
          break;
        }
        case 1: {
          fs.renameSync(pFullPath, cFullPath);
          break;
        }
        default: {
          return false;
        }
      }
      return true;
    }
  );
  ipcMain.on("onSave", (e, r) => {
    fs.writeFile(r.path, r.data, (err) => {
      console.log(err);
    });
  });
});
