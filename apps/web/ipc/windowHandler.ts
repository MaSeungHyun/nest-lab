import { ipcMain, BrowserWindow } from "electron";

export function registerWindowHandlers(getWindow: () => BrowserWindow | null) {
  ipcMain.on("window-minimize", () => {
    getWindow()?.minimize();
  });

  ipcMain.on("window-maximize", () => {
    const win = getWindow();
    if (win?.isMaximized()) {
      win?.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.on("window-close", () => {
    getWindow()?.close();
  });
}
