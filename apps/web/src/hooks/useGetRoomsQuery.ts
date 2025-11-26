import { useQuery } from "@tanstack/react-query";
import { getRooms } from "../api/chat";
import { roomKeys } from "../constants/queryKeys";

export default function useGetRoomsQuery() {
  return useQuery({
    queryKey: roomKeys.lists(),
    queryFn: getRooms,
    staleTime: 1000 * 60, // 1분간 fresh 상태 유지
    gcTime: 1000 * 60 * 5, // 5분간 캐시 유지 (구 cacheTime)
  });
}
