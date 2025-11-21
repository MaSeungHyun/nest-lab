import { BrowserWindow } from "electron";
import { registerWindowHandlers } from "./windowHandler";

export function registerAllHandlers(getWindow: () => BrowserWindow | null) {
  registerWindowHandlers(getWindow);
}
