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

  ipcMain.on("window-set-login-window-size", () => {
    const win = getWindow();
    if (win) {
      win.unmaximize();
      win.setResizable(false);
      win.setMinimumSize(720, 520);
      win.setSize(720, 520, true);
      win.center(); // 화면 중앙에 위치
    }
  });

  ipcMain.on("window-set-main-window-size", () => {
    const win = getWindow();
    if (win) {
      win.setResizable(true);
      win.maximize();
    }
  });
}
