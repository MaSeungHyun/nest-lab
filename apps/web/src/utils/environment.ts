export const isElectron = () => {
  return typeof window !== "undefined" && window.ipcRenderer;
};

export const safeIpcSend = (channel: string, args: any[] = []) => {
  const ipcRenderer = window.ipcRenderer;

  if (!ipcRenderer) {
    console.warn(`🚨 [IPC] Electron 환경이 아닙니다. 채널: ${channel}`);
    return;
  }

  ipcRenderer.send(channel, ...args);
};
