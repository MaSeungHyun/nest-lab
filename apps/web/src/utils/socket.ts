import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Socket 연결 생성 및 반환
 */
export const getSocket = (url: string = "http://localhost:3000"): Socket => {
  if (!socket) {
    socket = io(url, {
      transports: ["websocket", "polling"], // WebSocket 우선, 실패 시 polling
      autoConnect: false, // 수동 연결
    });
  }
  return socket;
};

/**
 * Socket 연결
 */
export const connectSocket = (url?: string) => {
  const socket = getSocket(url);
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

/**
 * Socket 연결 해제
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
