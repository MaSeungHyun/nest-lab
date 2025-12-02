import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useEditor } from "../../hooks/useEditor";
import { cn } from "../../utils/style";
import { useSocket } from "../../hooks/useSocket";
import { toast } from "sonner";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import useUserStore from "../../store/user";
import { isElectron } from "../../utils/environment";
import { EMPTY_ARRAY } from "../../components/TitleBar";

export default function Editor({ className }: { className?: string }) {
  const sceneViewRef = useRef<HTMLDivElement>(null);
  const { roomId } = useParams<{ roomId: string }>();
  const user = useCurrentUser();
  const { joinUser, leaveUser, clearRoomUsers, setRoomUsers } = useUserStore();

  const context = useEditor();
  const { socket, isConnected } = useSocket();
  const hasShownConnectionToast = useRef(false);
  const hasJoinedRoom = useRef(false);
  const previousRoomId = useRef<string | null>(null);
  const lastJoinedSocketId = useRef<string | null>(null);
  // 사용자별 toast ID 저장 (퇴장 시 입장 toast를 닫기 위해)
  const userToastIds = useRef<Map<string, string | number>>(new Map());

  // user 데이터 추출 (dependency 최적화)
  const userId = user?.data?.uuid;
  const userName = user?.data?.id;

  useEffect(() => {
    if (isConnected && !hasShownConnectionToast.current) {
      toast.success("Socket connected successfully");
      hasShownConnectionToast.current = true;
    } else if (!isConnected && hasShownConnectionToast.current) {
      // 연결이 끊겼을 때만 에러 표시하고 플래그 리셋
      toast.error("Socket not connected");
      hasShownConnectionToast.current = false;
    }
  }, [isConnected]);
  // 소켓 연결 상태 확인 및 로그
  useEffect(() => {
    if (socket) {
      console.log("[Editor] Socket instance:", socket.id || "not connected");
      console.log("[Editor] Socket connected:", socket.connected);
      //   if (user?.data?.uuid && user?.data?.id) {
      //     joinUser({
      //       uuid: user?.data?.uuid,
      //       id: user?.data?.id,
      //     });
      //   }

      if (!socket.connected) {
        console.log("[Editor] Attempting to connect socket...");
        socket.connect();
      }
    }
  }, [socket]);

  useEffect(() => {
    if (isConnected) {
      console.log("[Editor] ✅ Socket connected successfully");
      // 소켓이 재연결되면 방 입장을 다시 시도할 수 있도록 리셋
      // 새로운 socket.id가 생성되므로 이전 socket ID도 리셋
      if (hasJoinedRoom.current) {
        console.log(
          "[Editor] Socket reconnected, resetting joinRoom flag and socket ID"
        );
        hasJoinedRoom.current = false;
        lastJoinedSocketId.current = null;
      }
    } else {
      console.warn("[Editor] ⚠️ Socket not connected");
      // 소켓이 끊기면 입장 상태도 리셋
      hasJoinedRoom.current = false;
      lastJoinedSocketId.current = null;
    }
  }, [isConnected]);

  useEffect(() => {
    if (sceneViewRef.current) {
      console.time("SceneView Render");
      context.didMount(sceneViewRef.current);
      console.timeEnd("SceneView Render");
    }

    return () => {
      console.log("%cUnMount", "color: red");
      context.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Editor 컴포넌트 언마운트 시 방에서만 퇴장 (소켓은 유지)
  useEffect(() => {
    // cleanup 함수에서 사용할 최신 값들을 ref에 저장
    const currentSocket = socket;
    const currentRoomId = roomId;
    const currentUserId = userId;
    const currentUserName = userName;
    const currentHasJoinedRoom = hasJoinedRoom.current;

    // leaveRoom을 보내는 헬퍼 함수
    const sendLeaveRoom = () => {
      if (
        currentSocket &&
        currentHasJoinedRoom &&
        currentRoomId &&
        currentUserId &&
        currentUserName
      ) {
        console.log("[Editor] Sending leaveRoom:", {
          roomId: currentRoomId,
          userId: currentUserId,
          userName: currentUserName,
          socketConnected: currentSocket.connected,
        });

        // 소켓이 연결되어 있지 않아도 일단 보내기 시도
        // (서버에서 처리할 수 있도록)
        try {
          currentSocket.emit("leaveRoom", {
            roomId: currentRoomId,
            userId: currentUserId,
            userName: currentUserName,
          });
          console.log("[Editor] ✅ leaveRoom event sent to server");
        } catch (error) {
          console.error("[Editor] ❌ Error sending leaveRoom:", error);
        }

        hasJoinedRoom.current = false;
        lastJoinedSocketId.current = null;
      } else {
        console.log("[Editor] Cannot leave room:", {
          socket: !!currentSocket,
          hasJoinedRoom: currentHasJoinedRoom,
          roomId: !!currentRoomId,
          userId: !!currentUserId,
          userName: !!currentUserName,
        });
      }
    };

    // beforeunload 이벤트: 페이지를 떠나기 전에 실행 (뒤로가기 포함)
    const handleBeforeUnload = () => {
      console.log("[Editor] beforeunload event fired, sending leaveRoom");
      sendLeaveRoom();
    };

    // visibilitychange 이벤트: 탭이 숨겨질 때 실행
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("[Editor] Page hidden, sending leaveRoom");
        sendLeaveRoom();
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      console.log("[Editor] Component unmounting, leaving room...");
      // 이벤트 리스너 제거
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // cleanup에서도 leaveRoom 보내기 (이중 안전장치)
      sendLeaveRoom();

      // 소켓은 끊지 않음 (앱 전체에서 유지)
      console.log("[Editor] Left room, socket connection maintained");
    };
  }, [socket, roomId, userId, userName]);

  // 소켓으로 받은 transformUpdate 이벤트 처리
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log("[Editor] Socket not ready for transformUpdate listener", {
        socket: !!socket,
        isConnected,
      });
      return;
    }

    console.log("[Editor] ✅ Setting up transformUpdate listener");

    const handleTransformUpdate = (transformData: {
      name: string;
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number };
      quaternion: { x: number; y: number; z: number; w: number };
      scale: { x: number; y: number; z: number };
      mode?: string;
      users?: Array<{ userId: string; userName: string }>;
    }) => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📥 [Editor] Received transformUpdate from socket");
      console.log("Object Name:", transformData.name);
      console.log("Position:", transformData.position);
      console.log("Rotation:", transformData.rotation);
      console.log("Quaternion:", transformData.quaternion);
      console.log("Scale:", transformData.scale);
      console.log("Mode:", transformData.mode);
      console.log("Full Data:", transformData);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      context.updateObjectTransform(transformData);
    };

    socket.on("transformUpdate", handleTransformUpdate);
    console.log("[Editor] ✅ transformUpdate listener registered");

    return () => {
      console.log("[Editor] 🗑️ Removing transformUpdate listener");
      socket.off("transformUpdate", handleTransformUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isConnected]);

  // 사용자 입장/퇴장 이벤트 처리
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleUserJoined = (data: {
      userId: string;
      userName: string;
      message: string;
      users?: Array<{ userId: string; userName: string }>;
    }) => {
      console.log("[Editor] 📥 Received userJoined event:", data);

      // 본인이 아닌 경우에만 toast 표시
      if (data.userId !== userId) {
        // 기존 입장 toast가 있으면 닫기
        const existingToastId = userToastIds.current.get(data.userId);
        if (existingToastId) {
          toast.dismiss(existingToastId);
        }

        // 입장 toast 표시 (ID 저장)
        const toastId = toast.success(
          `${data.userName}님이 에디터에 입장했습니다.`,
          {
            description: `Room: ${roomId}`,
            duration: 5000, // 5초 후 자동 닫기
          }
        );

        // 사용자별 toast ID 저장
        userToastIds.current.set(data.userId, toastId);
      }

      // users 배열이 있으면 store에 전체 사용자 목록 업데이트
      if (data.users && data.users.length > 0) {
        console.log(
          "[Editor] Updating store with users from userJoined:",
          data.users
        );

        // 본인을 제외한 사용자 목록 생성
        const usersToAdd = data.users
          .filter((user) => user.userId !== userId)
          .map((user) => ({
            uuid: user.userId,
            id: user.userName,
          }));

        if (usersToAdd.length > 0) {
          console.log(
            `[Editor] Setting ${usersToAdd.length} users for room ${roomId} from userJoined:`,
            usersToAdd
          );
          setRoomUsers(roomId!, usersToAdd);
          console.log(
            "[Editor] ✅ Users updated in store from userJoined event"
          );
        } else {
          console.log("[Editor] No users to add (all are self)");
        }
      } else {
        // users 배열이 없으면 개별 사용자만 추가
        if (data.userId !== userId) {
          console.log("[Editor] Adding individual user to store:", {
            roomId,
            userId: data.userId,
            userName: data.userName,
          });
          joinUser(roomId!, {
            uuid: data.userId,
            id: data.userName,
          });
          console.log("[Editor] ✅ Individual user added to store");
        }
      }
    };

    const handleUserLeft = (data: {
      userName: string;
      message: string;
      userId?: string;
      users?: Array<{ userId: string; userName: string }>;
    }) => {
      console.log("[Editor] 📥 Received userLeft event:", data);

      // userId가 있으면 사용, 없으면 userName으로 찾기
      const userIdToRemove = data.userId || data.userName;

      // 해당 사용자의 입장 toast가 있으면 닫기
      const existingToastId = userToastIds.current.get(userIdToRemove);
      if (existingToastId) {
        toast.dismiss(existingToastId);
        userToastIds.current.delete(userIdToRemove);
      }

      // 퇴장 toast 표시
      toast.info(`${data.userName}님이 에디터에서 퇴장했습니다.`, {
        duration: 3000, // 3초 후 자동 닫기
      });

      // users 배열이 있으면 store에 전체 사용자 목록 업데이트
      if (data.users && data.users.length >= 0) {
        console.log(
          "[Editor] Updating store with users from userLeft:",
          data.users
        );

        // 본인을 제외한 사용자 목록 생성
        const usersToUpdate = data.users
          .filter((user) => user.userId !== userId)
          .map((user) => ({
            uuid: user.userId,
            id: user.userName,
          }));

        console.log(
          `[Editor] Setting ${usersToUpdate.length} users for room ${roomId} from userLeft:`,
          usersToUpdate
        );
        setRoomUsers(roomId!, usersToUpdate);
        console.log("[Editor] ✅ Users updated in store from userLeft event");
      } else {
        // users 배열이 없으면 개별 사용자만 제거
        leaveUser(roomId!, userIdToRemove);
        console.log("[Editor] ✅ Individual user removed from store");
      }
    };

    socket.on("userJoined", handleUserJoined);
    socket.on("userLeft", handleUserLeft);

    // cleanup 함수에서 사용할 ref 참조 저장
    const userToastIdsRef = userToastIds.current;

    return () => {
      socket.off("userJoined", handleUserJoined);
      socket.off("userLeft", handleUserLeft);
      // cleanup 시 모든 toast 닫기
      userToastIdsRef.forEach((toastId: string | number) => {
        toast.dismiss(toastId);
      });
      userToastIdsRef.clear();
    };
  }, [socket, isConnected, roomId, userId, joinUser, leaveUser, setRoomUsers]);

  // roomId 변경 시 이전 방에서 퇴장 및 사용자 정리
  useEffect(() => {
    if (!roomId) return;

    // roomId가 변경되면 이전 방에서 퇴장 처리
    if (previousRoomId.current && previousRoomId.current !== roomId) {
      console.log(
        `[Editor] Room changed from ${previousRoomId.current} to ${roomId}, leaving previous room`
      );

      // 이전 방에서 퇴장
      if (socket && hasJoinedRoom.current && userId && userName) {
        socket.emit("leaveRoom", {
          roomId: previousRoomId.current,
          userId,
          userName,
        });
        console.log(`[Editor] Left previous room: ${previousRoomId.current}`);
      }

      // 이전 방의 사용자 정리
      clearRoomUsers(previousRoomId.current);
      hasJoinedRoom.current = false; // 새 방에 입장할 수 있도록 리셋
      lastJoinedSocketId.current = null;
    }

    previousRoomId.current = roomId;
  }, [roomId, clearRoomUsers, socket, userId, userName]);

  // 에디터 방 입장 (소켓 연결 시마다 실행)
  useEffect(() => {
    if (!socket || !isConnected || !roomId || !userId || !userName) {
      console.log("[Editor] Cannot join room:", {
        socket: !!socket,
        isConnected,
        roomId: !!roomId,
        userId: !!userId,
        userName: !!userName,
      });
      return;
    }

    // 이미 입장한 경우 중복 방지 (같은 소켓 ID로 같은 방에 입장한 경우만)
    // 소켓이 재연결되면 새로운 socket.id가 생성되므로 다시 입장해야 함
    const currentSocketId = socket.id || null;

    if (
      hasJoinedRoom.current &&
      lastJoinedSocketId.current === currentSocketId
    ) {
      console.log(
        "[Editor] Already joined room with same socket ID, skipping..."
      );
      return;
    }

    // 에디터 방 입장
    console.log("[Editor] Emitting joinRoom:", {
      roomId,
      userId,
      userName,
      socketId: currentSocketId,
    });
    socket.emit("joinRoom", {
      roomId,
      userId,
      userName,
    });

    hasJoinedRoom.current = true;
    lastJoinedSocketId.current = currentSocketId;
    console.log("[Editor] ✅ Joined editor room:", roomId);

    // 현재 접속자 목록 수신 리스너
    const handleRoomUsers = (data: {
      users: Array<{ userId: string; userName: string }>;
    }) => {
      console.log("[Editor] 📥 Received current room users:", data.users);

      // 받은 사용자 목록을 User 객체로 변환 (본인 제외)
      const usersToAdd: Array<{ uuid: string; id: string }> = [];
      data.users.forEach((user) => {
        if (user.userId !== userId) {
          usersToAdd.push({
            uuid: user.userId,
            id: user.userName,
          });
        }
      });

      // 해당 방의 사용자 목록을 한 번에 설정
      if (usersToAdd.length > 0) {
        console.log(
          `[Editor] Setting ${usersToAdd.length} users for room ${roomId}:`,
          usersToAdd
        );
        setRoomUsers(roomId!, usersToAdd);
        console.log("[Editor] ✅ Users set in store for room:", roomId);
      } else {
        console.log("[Editor] No users to add (all already processed or self)");
      }
    };

    socket.on("roomUsers", handleRoomUsers);

    return () => {
      // roomUsers 리스너 제거
      socket.off("roomUsers", handleRoomUsers);
      // cleanup에서는 leaveRoom을 호출하지 않음 (컴포넌트 unmount 시 별도 처리)
    };
  }, [socket, isConnected, roomId, userId, userName, setRoomUsers]);

  const usersByRoom = useUserStore((state) => state.usersByRoom);

  const users = useMemo(() => {
    if (!roomId) {
      console.log("[Editor] No roomId found in path, returning empty array");
      return EMPTY_ARRAY;
    }
    const roomUsers = usersByRoom[roomId] || EMPTY_ARRAY;
    console.log("[Editor] Users for room:", roomId, ":", roomUsers);
    console.log("[Editor] Current path:", location.pathname);
    console.log("[Editor] All usersByRoom:", usersByRoom);
    return roomUsers;
  }, [roomId, usersByRoom, location.pathname]);
  return (
    <div className="flex h-full min-h-0 flex-col relative">
      <div className="flex items-center mr-2 top-3 right-0 z-50 absolute">
        {!isElectron() && users.length > 0 ? (
          users.slice(0, 3).map((user, index) => (
            <div
              key={user.uuid}
              className="text-sm text-white font-semibold w-5 h-5 rounded-full flex items-center justify-center  border right-0 top-3"
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
      {/* <SceneViewToolbar /> */}
      <div className="absolute top-10 left-5">
        Connected: {isConnected ? "🟢" : "🔴"}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref={sceneViewRef}
          className={cn(
            "from-black-500 to-black-100 h-full w-full flex-1 rounded-b-lg",
            "bg-[#404040]",
            className
          )}
        />
      </div>
    </div>
  );
}
