// apps/web/src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket, connectSocket, disconnectSocket } from "../utils/socket";

export const useSocket = (url?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = connectSocket(url);
    setSocket(socketInstance);

    // 연결 이벤트 리스너
    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // 클린업
    return () => {
      disconnectSocket();
    };
  }, [url]);

  return { socket, isConnected };
};
