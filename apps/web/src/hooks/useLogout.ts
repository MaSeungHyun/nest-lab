import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { userKeys, roomKeys } from "../constants/queryKeys";
import { disconnectSocket } from "../utils/socket";

/**
 * 로그아웃 Hook
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logout = () => {
    // 1. 유저 관련 모든 캐시 제거
    queryClient.removeQueries({ queryKey: userKeys.all });

    // 2. 채팅방 관련 캐시도 제거 (선택사항)
    queryClient.removeQueries({ queryKey: roomKeys.all });

    // 3. 소켓 연결 끊기 ✅
    disconnectSocket();
    console.log("Socket disconnected on logout");

    // 4. localStorage 클리어
    localStorage.removeItem("user");

    // 5. 로그인 페이지로 이동
    navigate("/login");
  };

  return { logout };
};
