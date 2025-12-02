import { useEffect } from "react";
import LobbyLeft from "./Left/LobbyLeft";
import LobbyRight from "./Right/LobbyRight";
import { useWindow } from "../../hooks/useWindow";
import { useSocket } from "../../hooks/useSocket";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export default function Dashboard() {
  const { setLoginSize } = useWindow();
  const { data: user } = useCurrentUser();
  const { socket } = useSocket();

  useEffect(() => {
    setLoginSize();

    socket?.emit("leaveRoom", {
      roomId: "lobby",
      userId: user?.data?.uuid,
      userName: user?.data?.id,
    });
  }, []);

  return (
    <div className="flex flex-1 overflow-hidden">
      <LobbyLeft />
      <LobbyRight />
    </div>
  );
}
