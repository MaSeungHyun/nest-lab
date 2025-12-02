import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
const DEFAULT_URL = "http://localhost:3000";

/**
 * Socket 연결 생성 및 반환
 */
export const getSocket = (url?: string): Socket => {
  const socketUrl = url || DEFAULT_URL;
  if (!socket) {
    console.log(`[Socket] Creating new socket instance for: ${socketUrl}`);
    socket = io(socketUrl, {
      transports: ["websocket", "polling"], // WebSocket 우선, 실패 시 polling
      autoConnect: false, // 수동 연결
    });

    // 디버깅을 위한 이벤트 리스너
    socket.on("connect", () => {
      if (socket) {
        console.log(
          `[Socket] ✅ Connected to server: ${socketUrl}, ID: ${socket.id}`
        );
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] ❌ Disconnected from server: ${reason}`);
    });

    socket.on("connect_error", (error) => {
      console.error(`[Socket] ❌ Connection error to ${socketUrl}:`, error);
    });
  } else {
    console.log(
      `[Socket] Using existing socket instance, ID: ${socket.id || "not connected"}`
    );
  }
  return socket;
};

/**
 * Socket 연결
 */
export const connectSocket = (url?: string) => {
  const socket = getSocket(url);
  if (!socket.connected) {
    console.log(`[Socket] Attempting to connect...`);
    socket.connect();
  } else {
    console.log(`[Socket] Already connected, ID: ${socket.id}`);
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
