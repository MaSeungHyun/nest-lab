import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRoom } from "../api/chat";
import { roomKeys } from "../constants/queryKeys";

export default function useDeleteChatRoomMutation() {
  const queryClient = useQueryClient();

  const { mutate, ...rest } = useMutation({
    mutationFn: (roomId: string) => deleteRoom(roomId),
    onSuccess: (data, roomId) => {
      // 채팅방 목록 쿼리를 무효화하여 자동으로 다시 fetch
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });

      // 삭제된 특정 채팅방의 상세 쿼리도 무효화
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
    },
  });

  return { deleteChatRoomMutation: mutate, ...rest };
}
