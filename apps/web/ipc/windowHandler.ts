import { ipcMain } from "electron";
import { WindowManager } from "../electron/windowManager";
import { WINDOW_SIZE } from "../electron/constants/window";

export const EVENT_CHANNEL_CONFIG = {
  MINIMIZE: "window-minimize",
  MAXIMIZE: "window-maximize",
  LOGIN: "window-login",
  LOGOUT: "window-logout",
  CLOSE: "window-close",
  CREATE_WINDOW: "window-create-window",
};

export function registerWindowHandlers(windowManager: WindowManager) {
  console.log(windowManager);
  ipcMain.on(EVENT_CHANNEL_CONFIG.MINIMIZE, (event: Electron.IpcMainEvent) => {
    const win = windowManager.findWindowByWebContentsId(event.sender.id);
    win?.minimize();
  });

  ipcMain.on(EVENT_CHANNEL_CONFIG.MAXIMIZE, (event: Electron.IpcMainEvent) => {
    const win = windowManager.findWindowByWebContentsId(event.sender.id);
    if (win?.isMaximized()) {
      win?.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.on(EVENT_CHANNEL_CONFIG.CLOSE, (event: Electron.IpcMainEvent) => {
    const win = windowManager.findWindowByWebContentsId(event.sender.id);
    win?.close();
  });

  ipcMain.on(EVENT_CHANNEL_CONFIG.LOGIN, (event: Electron.IpcMainEvent) => {
    const win = windowManager.findWindowByWebContentsId(event.sender.id);
    win?.setSize(WINDOW_SIZE.LOGIN.width, WINDOW_SIZE.LOGIN.height);
    win?.setResizable(true);
    win?.center();
  });

  ipcMain.on(EVENT_CHANNEL_CONFIG.LOGOUT, (event: Electron.IpcMainEvent) => {
    const win = windowManager.findWindowByWebContentsId(event.sender.id);
    win?.setSize(WINDOW_SIZE.LOGOUT.width, WINDOW_SIZE.LOGOUT.height);
    win?.setResizable(false);
    win?.center();
  });

  ipcMain.on(
    EVENT_CHANNEL_CONFIG.CREATE_WINDOW,
    (event: Electron.IpcMainEvent, options: { route?: string }) => {
      const {
        route = "/",
        width = WINDOW_SIZE.LOGIN.width,
        height = WINDOW_SIZE.LOGIN.height,
        resizable = true,
        frame = false,
      }: Electron.BrowserWindowConstructorOptions & {
        route?: string;
      } = options || {};
      const windowId = route;

      windowManager.createWindow(windowId, route, {
        width,
        height,
        resizable,
        frame,
      });
    }
  );
}
