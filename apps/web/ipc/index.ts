import { registerWindowHandlers } from "./windowHandler";
import { WindowManager } from "../electron/windowManager";

export function registerAllHandlers(windowManager: WindowManager) {
  registerWindowHandlers(windowManager);
}
