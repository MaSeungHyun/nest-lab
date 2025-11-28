import { useQuery } from "@tanstack/react-query";
import { userKeys } from "../constants/queryKeys";

/**
 * 현재 로그인한 유저 정보 조회
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      // TODO: 실제 API 호출로 교체
      // 현재는 localStorage에서 가져오기
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("Not authenticated");
      }
      return JSON.parse(userStr);
    },
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
    retry: false, // 인증 실패 시 재시도 안 함
  });
};
