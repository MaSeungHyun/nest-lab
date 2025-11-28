import React, { useEffect, useState } from "react";
import { Button } from "../../../components/Button";
import profile from "../../../assets/profile.jpg";
import CreateChatingRoomDialog from "./_components/CreateChatingRoomDialog";
import { useSocket } from "../../../hooks/useSocket";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

export default function LobbyLeft() {
  const { data: user } = useCurrentUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { socket, isConnected } = useSocket();

  // ✅ 로비에서는 소켓 관리 불필요
  // 소켓은 앱 전체에서 계속 연결 유지
  // 채팅방 입장/퇴장은 ChatRoom에서 관리

  console.log(user);
  return (
    <div className="flex-2 bg-zinc-800 flex flex-col items-center pt-5 border-r border-zinc-500">
      <p>Socket Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</p>
      <img
        src={profile}
        alt="profile"
        className="w-1/6 mt-3 mb-5 min-w-[120px] rounded-full"
      />
      <p>{user?.id}</p>

      <div className="px-2">
        <CreateChatingRoomDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        >
          <Button className="w-full mt-5">Create Room</Button>
        </CreateChatingRoomDialog>
      </div>
    </div>
  );
}
