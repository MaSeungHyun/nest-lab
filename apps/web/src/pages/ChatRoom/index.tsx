import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import Icon from "../../components/Icon";
import { useSocket } from "../../hooks/useSocket";

export default function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  // 채팅방 입장/퇴장 관리
  useEffect(() => {
    if (!socket || !isConnected) return;

    // TODO: 실제 유저 정보로 교체 (useCurrentUser 사용)
    const userId = "user-" + Math.random().toString(36).substr(2, 9);
    const userName = "User" + Math.floor(Math.random() * 1000);

    const roomData = {
      roomId: roomId!,
      userId,
      userName,
    };

    // ✅ 채팅방 입장
    socket.emit("joinRoom", roomData);
    console.log("✅ Joined room:", roomId);

    // ✅ 채팅방 퇴장 (컴포넌트 언마운트 시)
    return () => {
      socket.emit("leaveRoom", {
        roomId: roomId!,
        userName,
      });
      console.log("👋 Left room:", roomId);
    };
  }, [socket, isConnected, roomId]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  // 핑-퐁 테스트 (나중에 제거)
  useEffect(() => {
    if (!socket) return;

    socket.emit("ping");
    socket.on("pong", (data) => {
      console.log("Received pong:", data);
    });

    return () => {
      socket?.off("pong");
    };
  }, [socket]);

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white">
      {/* 헤더 */}
      <div className="flex items-center gap-4 px-2 py-4 border-b border-zinc-700">
        <button
          onClick={handleBack}
          className="hover:bg-zinc-800 p-2 rounded-md transition-colors"
        >
          <Icon icon="ChevronLeft" size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">채팅방</h1>
          <p className="text-sm text-zinc-400">Room ID: {roomId}</p>
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center text-zinc-500">
          채팅 기능 구현 예정
          <p>
            Socket Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </p>
        </div>
      </div>

      {/* 메시지 입력 영역 */}
      <div className="border-t border-zinc-700 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-zinc-500"
          />
          <Button>전송</Button>
        </div>
      </div>
    </div>
  );
}
