import * as DialogPrimitives from "@radix-ui/react-dialog";
import { cn } from "../../utils/style";

const Root = DialogPrimitives.Root;

type DialogTriggerProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitives.Trigger
> & {
  children: React.ReactNode;
  className?: string;
};

const DialogTrigger = ({
  children,
  className = "",
  ...props
}: DialogTriggerProps): React.ReactNode => {
  return (
    <DialogPrimitives.Trigger
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </DialogPrimitives.Trigger>
  );
};

type DialogContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitives.Content
> & {
  children: React.ReactNode;
  className?: string;
  outsideClickClose?: boolean;
  overlayClassName?: string;
};

const DialogContent = ({
  children,
  className = "",
  outsideClickClose = false,
  overlayClassName,
  ...props
}: DialogContentProps): React.ReactNode => {
  return (
    <DialogPrimitives.Portal>
      <DialogPrimitives.Overlay
        className={cn(
          "absolute inset-0 left-0 top-0 flex bg-black/50",
          overlayClassName
        )}
      />
      <DialogPrimitives.Content
        onPointerDownOutside={(e) => {
          if (!outsideClickClose) {
            e.preventDefault();
          }
        }}
        className={cn(
          "bg-zinc-800 z-2 absolute left-1/2 top-1/2 min-h-[200px] min-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-md border border-zinc-800 px-6 py-4 shadow-md shadow-black flex flex-col",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitives.Content>
    </DialogPrimitives.Portal>
  );
};

type DialogTitleProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitives.Title
> & {
  children: React.ReactNode;
  className?: string;
};

const DialogTitle = ({
  children,
  className = "",
  ...props
}: DialogTitleProps): React.ReactNode => {
  return (
    <DialogPrimitives.Title
      className={cn(
        "mb-5 text-md font-bold text-white flex gap-2 items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitives.Title>
  );
};

type DialogDescriptionProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitives.Description
> & {
  children: React.ReactNode;
  className?: string;
};
const DialogDescription = ({
  children,
  className = "",
  ...props
}: DialogDescriptionProps): React.ReactNode => {
  return (
    <DialogPrimitives.Description
      className={cn(
        "flex-1 text-sm text-gray-100 whitespace-pre-wrap",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitives.Description>
  );
};

type DialogCloseProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitives.Close
> & {
  className?: string;
};
const DialogClose = ({
  className = "",
  ...props
}: DialogCloseProps): React.ReactNode => {
  return (
    <DialogPrimitives.Close
      className={cn("cursor-pointer", className)}
      {...props}
    />
  );
};

type DialogFooterProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode;
  className?: string;
};
const DialogFooter = ({
  children,
  className = "",
  ...props
}: DialogFooterProps): React.ReactNode => {
  return (
    <div
      className={cn(
        "flex min-h-[30px] w-full items-center mt-2 justify-end gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const Dialog = {
  Root,
  Trigger: DialogTrigger,
  Title: DialogTitle,
  Description: DialogDescription,
  Footer: DialogFooter,
  Close: DialogClose,
  Content: DialogContent,
};
