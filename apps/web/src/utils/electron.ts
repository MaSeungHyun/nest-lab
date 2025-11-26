/**
 * Electron 관련 유틸리티 함수
 */

/**
 * 현재 환경이 Electron 앱인지 확인
 */
export const isElectron = (): boolean => {
  return typeof window !== "undefined" && window.ipcRenderer !== undefined;
};

/**
 * 현재 환경이 웹 브라우저인지 확인
 */
export const isWeb = (): boolean => {
  return !isElectron();
};

/**
 * Electron IPC Renderer 가져오기 (타입 안전)
 */
export const getIpcRenderer = () => {
  if (!isElectron()) {
    console.warn("IPC Renderer is not available in web environment");
    return null;
  }
  return window.ipcRenderer;
};

/**
 * Electron 환경에서만 IPC 리스너 등록
 */
export const onIpcMessage = (
  channel: string,
  callback: (...args: any[]) => void
) => {
  const ipcRenderer = getIpcRenderer();
  if (ipcRenderer) {
    ipcRenderer.on(channel, callback);

    // 클린업 함수 반환
    return () => {
      ipcRenderer.off(channel, callback);
    };
  }
  return () => {}; // 웹 환경에서는 빈 클린업 함수
};

/**
 * Electron 환경에서만 IPC 메시지 전송
 */
export const sendIpcMessage = (channel: string, ...args: any[]) => {
  const ipcRenderer = getIpcRenderer();
  if (ipcRenderer) {
    ipcRenderer.send(channel, ...args);
  }
};

/**
 * Electron 환경에서만 IPC invoke (비동기)
 */
export const invokeIpc = async (channel: string, ...args: any[]) => {
  const ipcRenderer = getIpcRenderer();
  if (ipcRenderer) {
    return await ipcRenderer.invoke(channel, ...args);
  }
  throw new Error("IPC is not available in web environment");
};
