import React, { useEffect } from "react";
import { Dialog } from "../../../../../components/Dialog";
import { Button } from "../../../../../components/Button";
import Input from "../../../../../components/Input";
import Icon from "../../../../../components/Icon";
// import { CreateChatRoomResponseDto } from "../../../../../types/common/chat.dto";

type CreateChatingRoomDialogProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};
export default function ProjectCreateDialog({
  children,
  isOpen,
  onOpenChange,
}: CreateChatingRoomDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>
          <span>Create Project</span>
          <Dialog.Close>
            <Icon icon="X" size={16} />
          </Dialog.Close>
        </Dialog.Title>
        <Dialog.Description>
          <Input
            className="w-full mt-3"
            autoFocus
            placeholder="Enter Project Name"
          />
        </Dialog.Description>
        <Dialog.Footer>
          <Dialog.Close>
            <Button>Create</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
