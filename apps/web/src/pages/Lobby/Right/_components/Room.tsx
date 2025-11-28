import React from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../../components/Icon";
import { alert } from "../../../../utils/alert";
import useDeleteChatRoomMutation from "../../../../hooks/useDeleteChatRoomMutation";
import { useWindow } from "../../../../hooks/useWindow";
import { WINDOW_SIZE } from "../../../../../electron/constants/window";

type RoomProps = {
  room: { uuid: string; name: string; createdAt: string };
};
function Room({ room }: RoomProps) {
  const navigate = useNavigate();
  const { createWindow } = useWindow();
  const { deleteChatRoomMutation } = useDeleteChatRoomMutation();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 요소로 이벤트 전파 방지

    deleteChatRoomMutation(room.uuid, {
      onSuccess: (data: { success: boolean; message: string }) => {
        // 서버가 실패 시 HTTP 에러를 반환하므로
        // onSuccess는 실제 성공 시에만 실행됨
        alert.success(data.message, "채팅방 삭제 성공");
      },
      onError: (error: Error) => {
        // HTTP 에러 시 실행 (404 Not Found 등)
        alert.error(error.message, "채팅방 삭제 실패");
      },
    });
  };

  const handleRoomClick = () => {
    // 채팅방 클릭 시 해당 채팅방으로 이동
    // URL: /chat/:roomId (경로 파라미터 사용)
    // navigate(`/chat/${room.uuid}`);
    createWindow({
      route: `/chat/${room.uuid}`,
      width: WINDOW_SIZE.LOGOUT.width,
      height: WINDOW_SIZE.LOGOUT.height + 100,
      resizable: true,
      frame: false,
    });
  };

  return (
    <div className="relative min-w-[220px]">
      <div
        className="absolute right-2 top-2 group hover:cursor-pointer z-10"
        onClick={handleDeleteClick}
      >
        <Icon icon="X" size={20} className="group-hover:text-red-500 " />
      </div>
      <div
        className="flex flex-col group hover:bg-zinc-700 w-full h-full px-2 gap-5 py-2 rounded-sm border-zinc-500 bg-zinc-800  cursor-pointer border"
        onClick={handleRoomClick}
      >
        <h1 className="text-lg font-bold">{room.name}</h1>
        <p className="text-sm text-zinc-400">
          생성: {new Date(room.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default Room;
