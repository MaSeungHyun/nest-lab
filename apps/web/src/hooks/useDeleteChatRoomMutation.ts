import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRoom } from "../api/chat";
import { roomKeys } from "../constants/queryKeys";

export default function useDeleteChatRoomMutation() {
  const queryClient = useQueryClient();

  const { mutate, ...rest } = useMutation({
    mutationFn: (roomId: string) => deleteRoom(roomId),
    onSuccess: (data, roomId) => {
      // 서버가 실패 시 HTTP 에러(404 등)를 반환하므로
      // onSuccess는 실제 성공 시에만 실행됨

      // 채팅방 목록 쿼리를 무효화하여 자동으로 다시 fetch
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });

      // 삭제된 특정 채팅방의 상세 쿼리도 무효화
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
    },
    onError: (error: Error) => {
      // 실패 시 (HTTP 에러 상태) 여기서 처리
      console.error("채팅방 삭제 실패:", error.message);
    },
  });

  return { deleteChatRoomMutation: mutate, ...rest };
}
