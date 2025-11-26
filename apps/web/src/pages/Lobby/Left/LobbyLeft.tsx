import React, { useState } from "react";
import { Button } from "../../../components/Button";
import profile from "../../../assets/profile.jpg";
import CreateChatingRoomDialog from "./_components/CreateChatingRoomDialog";

export default function LobbyLeft() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex-2 bg-zinc-800 flex flex-col items-center pt-5 border-r border-zinc-500">
      <img
        src={profile}
        alt="profile"
        className="w-1/6 mt-3 mb-5 min-w-[120px] rounded-full"
      />
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
