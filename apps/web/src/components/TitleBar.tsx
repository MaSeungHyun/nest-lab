import { useMemo } from "react";
import useUserStore, { User } from "../store/user";
import { safeIpcSend } from "../utils/environment";
import { cn } from "../utils/style";
import Icon from "./Icon";
import { useLocation } from "react-router-dom";

// 빈 배열 상수 (참조 안정화)
export const EMPTY_ARRAY: User[] = [];

export default function TitleBar() {
  const location = useLocation();
  // Zustand store를 구독하여 roomId별 사용자 목록 가져오기
  // roomId가 변경되거나 해당 roomId의 사용자 배열이 변경될 때 리렌더링
  const usersByRoom = useUserStore((state) => state.usersByRoom);

  // URL 경로에서 Editor의 roomId 추출
  // 예: /editor/abc-123-def -> roomId = "abc-123-def"
  const roomId = useMemo(() => {
    const editorMatch = location.pathname.match(/^\/editor\/([^/]+)/);
    if (editorMatch && editorMatch[1]) {
      return editorMatch[1];
    }
    return null;
  }, [location.pathname]);

  // useMemo로 배열 참조 안정화 (무한 루프 방지)
  const users = useMemo(() => {
    if (!roomId) {
      console.log("[TitleBar] No roomId found in path, returning empty array");
      return EMPTY_ARRAY;
    }
    const roomUsers = usersByRoom[roomId] || EMPTY_ARRAY;
    console.log("[TitleBar] Users for room:", roomId, ":", roomUsers);
    console.log("[TitleBar] Current path:", location.pathname);
    console.log("[TitleBar] All usersByRoom:", usersByRoom);
    return roomUsers;
  }, [roomId, usersByRoom, location.pathname]);
  const handleMinimize = () => {
    safeIpcSend("window-minimize");
  };

  const handleMaximize = () => {
    safeIpcSend("window-maximize");
  };

  const handleClose = () => {
    safeIpcSend("window-close");
  };

  const handleClickBack = () => {
    history.back();
  };

  const handleClickForward = () => {
    history.forward();
  };

  console.log(users);
  return (
    <div
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      className="relative top-0 left-0 right-0 h-8 bg-zinc-900 flex items-center justify-between select-none z-50 "
    >
      <div
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        className="flex items-center gap-4 px-2 md:px-2 lg:px-2"
      >
        {/* <div className="group hover:cursor-pointer" onClick={handleClickBack}>
          <Icon
            icon="ArrowLeft"
            size={16}
            className={cn("stroke-gray-300 group-hover:stroke-white stroke-3")}
          />
        </div>
        <div
          className="hover:cursor-pointer group"
          onClick={handleClickForward}
        >
          <Icon
            icon="ArrowRight"
            size={16}
            className={cn("stroke-3 stroke-gray-300 group-hover:stroke-white")}
          />
        </div> */}
      </div>
      {/* 앱 타이틀 */}
      <div className="flex items-center gap-2 px-4">
        <span className="text-sm text-gray-300 font-semibold">
          {/* Grapicar Messenger */}
        </span>
      </div>

      {/* 윈도우 컨트롤 버튼 */}

      <div
        className="flex h-full items-center relative"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <div className="flex items-center mr-2">
          {users.length > 0 ? (
            users.slice(0, 3).map((user, index) => (
              <div
                key={user.uuid}
                className="text-sm text-white font-semibold w-5 h-5 rounded-full flex items-center justify-center absolute border"
                style={{
                  backgroundColor: `rgb(${Math.random() * 155}, ${Math.random() * 155}, ${Math.random() * 155})`,
                  left: `${-(index + 1) * 15}px`,
                }}
              >
                {user.id?.toUpperCase().slice(0, 1) || "?"}
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-400"></div>
          )}
        </div>
        <button
          onClick={handleMinimize}
          className={cn(
            "px-4 hover:bg-zinc-700 transition-colors flex items-center justify-center h-full"
          )}
        >
          <Icon icon="Minus" size={16} className="text-gray-300" />
        </button>
        <button
          onClick={handleMaximize}
          className={cn(
            "px-4 hover:bg-zinc-700 transition-colors flex items-center justify-center h-full"
          )}
        >
          <Icon icon="Square" size={14} className="text-gray-300" />
        </button>
        <button
          onClick={handleClose}
          className={cn(
            "px-4 hover:bg-red-600 transition-colors flex items-center justify-center h-full"
          )}
        >
          <Icon icon="X" size={16} className="text-gray-300" />
        </button>
      </div>
    </div>
  );
}
