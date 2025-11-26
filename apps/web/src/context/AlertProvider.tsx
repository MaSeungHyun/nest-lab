import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Dialog } from "../components/Dialog/Dialog";
import Icon from "../components/Icon";
import { Button } from "../components/Button";
import { cn } from "../utils/style";
import { setAlertContext } from "../utils/alert";
import { icons } from "lucide-react";

type AlertType = "warn" | "info" | "error" | "success";

interface AlertState {
  type: AlertType;
  message: string;
  title?: string;
  onClose?: () => void;
}

interface AlertContextType {
  showAlert: (
    type: AlertType,
    message: string,
    title?: string,
    onClose?: () => void
  ) => void;
  closeAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const [alert, setAlert] = useState<AlertState | undefined>(undefined);

  const showAlert = useCallback(
    (
      type: AlertType,
      message: string,
      title?: string,
      onClose?: () => void
    ) => {
      setAlert({ type, message, title, onClose });
    },
    []
  );

  const closeAlert = useCallback(() => {
    if (alert?.onClose) {
      alert.onClose();
    }
    setAlert(undefined);
  }, [alert]);

  useEffect((): (() => void) => {
    setAlertContext({ showAlert });
    return (): void => {
      setAlertContext(undefined);
    };
  }, [showAlert]);

  const renderAlertContent = (): React.ReactNode => {
    if (!alert) return undefined;

    const defaultTitle = {
      warn: "Warning",
      info: "Information",
      error: "Error",
      success: "Success",
    }[alert.type];

    const iconMap: Record<AlertType, string> = {
      warn: "TriangleAlert",
      info: "Info",
      error: "Ban",
      success: "CircleCheck",
    };

    const iconColorMap = {
      warn: "stroke-black-300 fill-amber-400",
      info: "stroke-black-300 fill-blue-400",
      error: "stroke-red-400 fill-black-300",
      success: "stroke-black-300 fill-green-400",
    } as const;

    return (
      <Dialog.Root open={true} onOpenChange={(open) => !open && closeAlert()}>
        <Dialog.Content>
          <Dialog.Title className="items-center justify-start">
            <Icon
              icon={iconMap[alert.type] as keyof typeof icons}
              size={20}
              className={cn(iconColorMap[alert.type])}
            />
            <span>{alert.title ?? defaultTitle}</span>
          </Dialog.Title>
          <Dialog.Description>{alert.message}</Dialog.Description>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button autoFocus className="w-full" onClick={closeAlert}>
                Close
              </Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    );
  };

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}
      {renderAlertContent()}
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
}
