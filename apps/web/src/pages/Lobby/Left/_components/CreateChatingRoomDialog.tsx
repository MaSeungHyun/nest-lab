import React, { useEffect, useState } from "react";
import { Dialog } from "../../../../components/Dialog";
import { Button } from "../../../../components/Button";
import Input from "../../../../components/Input";
import Icon from "../../../../components/Icon";
import useCreateChatRoomMutation from "../../../../hooks/useCreateChatRoomMutation";
// import { CreateChatRoomResponseDto } from "../../../../../types/common/chat.dto";
import { alert } from "../../../../utils/alert";
import { useQueryClient } from "@tanstack/react-query";
import { roomKeys } from "../../../../constants/queryKeys";

type CreateChatingRoomDialogProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};
function CreateChatingRoomDialog({
  children,
  isOpen,
  onOpenChange,
}: CreateChatingRoomDialogProps) {
  const queryClient = useQueryClient();

  const [roomName, setRoomName] = useState("");

  const { createChatRoomMutation } = useCreateChatRoomMutation();

  const handleChangeRoomName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };

  const handleCreateChatingRoom = () => {
    createChatRoomMutation(
      { roomName },
      {
        onError: (error) => {
          alert.error("채팅방 생성 실패", error.message as string);
        },
        onSuccess: (data) => {
          if ((data as { success: boolean })?.success) {
            alert.success(
              "채팅방 생성 성공",
              "채팅방 생성 성공하였습니다.",
              () => {
                onOpenChange(false);
                queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
              }
            );
          } else {
            alert.error(
              "채팅방 생성 실패",
              (data as { message: string })?.message as string
            );
          }
        },
      }
    );
  };

  useEffect(() => {
    return () => {
      setRoomName("");
    };
  }, []);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>
          <span>💬 채팅방 만들기</span>
          <Dialog.Close>
            <Icon icon="X" size={16} />
          </Dialog.Close>
        </Dialog.Title>
        <Dialog.Description>
          <Input
            className="w-full mt-3"
            autoFocus
            placeholder="Room Name"
            value={roomName}
            onChange={handleChangeRoomName}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleCreateChatingRoom();
              }
            }}
          />
        </Dialog.Description>
        <Dialog.Footer>
          <Dialog.Close>
            <Button className="w-full" onClick={handleCreateChatingRoom}>
              Create
            </Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default CreateChatingRoomDialog;
