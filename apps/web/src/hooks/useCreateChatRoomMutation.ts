import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "../utils/queryClient";
import { create } from "../api/chat";

export default function useCreateChatRoomMutation() {
  const { mutate, ...rest } = useMutation({
    mutationFn: ({ roomName }: { roomName: string }) => create(roomName),
  });

  return { createChatRoomMutation: mutate, ...rest };
}
