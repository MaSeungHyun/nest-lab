// 메시지 컴포넌트
type MessageProps = {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
  isOwn: boolean; // 내가 보낸 메시지인지
};

export const Message = ({
  userName,
  message,
  createdAt,
  isOwn,
}: MessageProps) => {
  const time = new Date(createdAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex flex-col max-w-[70%] ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        {/* 사용자 이름 (받은 메시지만) */}
        {!isOwn && (
          <span className="text-xs text-zinc-400 mb-1 px-2">{userName}</span>
        )}

        {/* 메시지 버블 */}
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwn
              ? "bg-cyan-700 text-white rounded-br-none"
              : "bg-zinc-800 text-white rounded-bl-none"
          }`}
        >
          <p className="text-sm break-words">{message}</p>
        </div>

        {/* 시간 */}
        <span className="text-xs text-zinc-500 mt-1 px-2">{time}</span>
      </div>
    </div>
  );
};
