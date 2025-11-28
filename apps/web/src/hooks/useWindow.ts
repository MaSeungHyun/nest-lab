import { useCallback } from "react";
import { safeIpcSend } from "../utils/environment";

type WindowOptions = Electron.BrowserWindowConstructorOptions & {
  route?: string;
};

const IPC = {
  WINDOW: {
    CREATE_WINDOW: "window-create-window",
    MINIMIZE: "window-minimize",
    MAXIMIZE: "window-maximize",
    CLOSE: "window-close",
    LOGIN: "window-login",
    LOGOUT: "window-logout",
  },
};

export const useWindow = (options?: WindowOptions) => {
  const minimize = useCallback(() => {
    safeIpcSend(IPC.WINDOW.MINIMIZE);
  }, []);
  const maximize = useCallback(() => {
    safeIpcSend(IPC.WINDOW.MAXIMIZE);
  }, []);
  const close = useCallback(() => {
    safeIpcSend(IPC.WINDOW.CLOSE);
  }, []);

  const setLoginSize = useCallback(() => {
    safeIpcSend(IPC.WINDOW.LOGIN);
  }, []);

  const setLogoutSize = useCallback(() => {
    safeIpcSend(IPC.WINDOW.LOGOUT);
  }, []);
  const createWindow = useCallback((options: WindowOptions = { route: "" }) => {
    safeIpcSend(IPC.WINDOW.CREATE_WINDOW, [options]);
  }, []);

  return {
    minimize,
    maximize,
    close,
    createWindow,
    setLoginSize,
    setLogoutSize,
    ...options,
  };
};
