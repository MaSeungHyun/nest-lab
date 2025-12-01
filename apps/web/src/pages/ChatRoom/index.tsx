import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../../components/Button";
import { useSocket } from "../../hooks/useSocket";
import { Message } from "../../components/Chat/Message";
import { useCurrentUser } from "../../hooks/useCurrentUser";

type ChatMessage = {
  id: string;
  type: "message" | "system" | "join" | "leave";
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
};

export default function ChatRoom() {
  const user = useCurrentUser();
  const { roomId } = useParams<{ roomId: string }>();
  const { socket, isConnected } = useSocket();

  // 메시지 상태
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  // 현재 사용자 정보 (실제로는 인증 정보에서 가져와야 함)
  const [currentUser, setCurrentUser] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  // 스크롤을 위한 ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 채팅방 입장/퇴장 관리
  useEffect(() => {
    if (!socket || !isConnected) return;

    // TODO: 실제 유저 정보로 교체 (useCurrentUser 사용)
    const userId = user?.data?.uuid;
    const userName = user?.data?.id;

    setCurrentUser({ userId, userName });

    const roomData = {
      roomId: roomId!,
      userId,
      userName,
    };

    // ✅ 채팅방 입장
    socket.emit("joinRoom", roomData);
    console.log("✅ Joined room:", roomId);

    setMessages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        type: "join",
        userId,
        userName,
        message: `${userName}님이 입장했습니다.`,
        createdAt: new Date().toISOString(),
      },
    ]);
    // ✅ 채팅방 퇴장 (컴포넌트 언마운트 시)
    return () => {
      socket.emit("leaveRoom", {
        roomId: roomId!,
        userName,
      });
      console.log("👋 Left room:", roomId);
    };
  }, [socket, isConnected, roomId]);

  // 메시지 수신 리스너
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (messageData: ChatMessage) => {
      setMessages((prev) => {
        // 중복 방지: 이미 같은 ID의 메시지가 있으면 추가하지 않음
        const exists = prev.some((msg) => msg.id === messageData.id);
        if (exists) return prev;

        // 임시 메시지(temp-)를 실제 메시지로 교체
        const hasTempMessage = prev.some(
          (msg) =>
            msg.id.startsWith("temp-") &&
            msg.userId === messageData.userId &&
            msg.message === messageData.message
        );

        if (hasTempMessage) {
          // 임시 메시지를 실제 메시지로 교체
          return prev.map((msg) =>
            msg.id.startsWith("temp-") &&
            msg.userId === messageData.userId &&
            msg.message === messageData.message
              ? messageData
              : msg
          );
        }

        // 새 메시지 추가
        return [...prev, messageData];
      });
    };

    const handleUserJoined = (data: {
      userId: string;
      userName: string;
      message: string;
    }) => {
      // 시스템 메시지로 표시 (선택사항)
      console.log("User joined:", data);
    };

    const handleUserLeft = (data: { userName: string; message: string }) => {
      // 시스템 메시지로 표시 (선택사항)
      console.log("User left:", data);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userJoined", handleUserJoined);
    socket.on("userLeft", handleUserLeft);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("userJoined", handleUserJoined);
      socket.off("userLeft", handleUserLeft);
    };
  }, [socket]);

  // 메시지 전송
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!socket || !inputMessage.trim() || !currentUser || !roomId) return;

    const messageText = inputMessage.trim();

    // 서버로 전송
    const messageData = {
      id: `temp-${Date.now()}`, // 임시 ID
      type: "message",
      roomId,
      userId: currentUser.userId,
      userName: currentUser.userName,
      message: messageText,
      createdAt: new Date().toISOString(),
    };
    // 즉시 상태에 추가
    setMessages((prev) => [...prev, messageData]);
    setInputMessage("");

    socket.emit("sendMessage", messageData);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white">
      {/* 헤더 */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-zinc-700">
        <div>
          <h1 className="text-xl font-bold">채팅방</h1>
          <p className="text-sm text-zinc-400">
            Room ID: {roomId} | Status: <br />
            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </p>
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500 mt-8">
            <p>아직 메시지가 없습니다.</p>
            <p className="text-sm mt-2">메시지를 입력해보세요!</p>
          </div>
        ) : (
          <div>
            {messages.map((msg) => {
              console.log(messages);

              return msg.type === "message" ? (
                <Message
                  key={msg.id}
                  {...msg}
                  isOwn={msg.userId === currentUser?.userId}
                />
              ) : msg.type === "join" || msg.type === "leave" ? (
                <div
                  key={msg.id}
                  className="flex items-center w-full justify-center mt-2"
                >
                  <div
                    key={msg.id}
                    className="text-zinc-300 text-xs rounded-full px-5 py-1 bg-zinc-800"
                  >
                    {msg.message}
                  </div>
                </div>
              ) : null;
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 메시지 입력 영역 */}
      <div className="border-t border-zinc-700 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-blue-500 text-white"
            disabled={!isConnected}
          />
          <Button type="submit" disabled={!isConnected || !inputMessage.trim()}>
            전송
          </Button>
        </form>
      </div>
    </div>
  );
}
