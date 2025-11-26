type AlertContextType = {
  showAlert: (
    type: "warn" | "info" | "error" | "success",
    message: string,
    title?: string,
    onClose?: () => void
  ) => void;
};

let alertContext: AlertContextType | undefined = undefined;

export function setAlertContext(context: AlertContextType | undefined): void {
  alertContext = context;
}

const warn = (message: string, title?: string, onClose?: () => void): void => {
  if (alertContext) {
    alertContext.showAlert("warn", message, title, onClose);
  } else {
    console.warn("Alert context not initialized. Message:", message);
  }
};

const info = (message: string, title?: string, onClose?: () => void): void => {
  if (alertContext) {
    alertContext.showAlert("info", message, title, onClose);
  } else {
    console.info("Alert context not initialized. Message:", message);
  }
};

const error = (message: string, title?: string, onClose?: () => void): void => {
  if (alertContext) {
    alertContext.showAlert("error", message, title, onClose);
  } else {
    console.error("Alert context not initialized. Message:", message);
  }
};

const success = (
  message: string,
  title?: string,
  onClose?: () => void
): void => {
  if (alertContext) {
    alertContext.showAlert("success", message, title, onClose);
  } else {
    console.log("Alert context not initialized. Message:", message);
  }
};

export const alert = {
  warn,
  info,
  error,
  success,
};
