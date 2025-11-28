// apps/web/electron/windowManager/index.ts
import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "node:url";
import { WINDOW_SIZE } from "../constants/window";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class WindowManager {
  private windows = new Map<string, BrowserWindow>();
  private mainWindow: BrowserWindow | null = null;

  constructor(private devServerUrl?: string) {
    console.log("[WindowManager] Initialized with devServerUrl:", devServerUrl);
    console.log("[WindowManager] __dirname:", __dirname);
    console.log("[WindowManager] APP_ROOT:", process.env.APP_ROOT);
  }

  createMainWindow(options?: Electron.BrowserWindowConstructorOptions) {
    // ✅ main.ts의 __dirname 사용 (더 정확함)
    const preloadPath = path.join(
      process.env.APP_ROOT!,
      "dist-electron",
      "preload.mjs"
    );
    console.log("[WindowManager] Main window preload path:", preloadPath);

    const defaultOptions: Electron.BrowserWindowConstructorOptions = {
      width: WINDOW_SIZE.LOGOUT.width,
      height: WINDOW_SIZE.LOGOUT.height,
      resizable: false,
      frame: false,
      webPreferences: {
        preload: preloadPath,
      },
    };

    this.mainWindow = new BrowserWindow({ ...defaultOptions, ...options });
    this.windows.set("hub", this.mainWindow);
    this.loadURL(this.mainWindow, "/");

    this.mainWindow.on("closed", () => {
      console.log("닫힘");
      this.mainWindow = null;
    });

    return this.mainWindow;
  }

  createWindow(
    id: string,
    route: string,
    options?: Electron.BrowserWindowConstructorOptions
  ) {
    this.closeWindow("hub");

    console.log("[WindowManager] Creating new window:", { id, route, options });

    // ✅ 동일한 preload 경로 사용
    const preloadPath = path.join(
      process.env.APP_ROOT!,
      "dist-electron",
      "preload.mjs"
    );
    console.log("[WindowManager] New window preload path:", preloadPath);

    const defaultOptions: Electron.BrowserWindowConstructorOptions = {
      width: WINDOW_SIZE.LOGIN.width,
      height: WINDOW_SIZE.LOGIN.height,
      resizable: true,
      frame: false,
      webPreferences: {
        preload: preloadPath,
      },
    };

    const win = new BrowserWindow({ ...defaultOptions, ...options });
    this.windows.set("main", win);
    this.mainWindow = win;

    console.log("[WindowManager] Window created, loading URL...");
    this.loadURL(win, route);

    // ✅ 윈도우가 실제로 보이는지 확인
    win.once("ready-to-show", () => {
      console.log("[WindowManager] Window ready to show");
      win.show();

      console.log("메인 윈도우 변경");
    });

    win.on("closed", () => {
      console.log("[WindowManager] Window closed:", id);
      this.windows.delete(id);
    });

    return win;
  }

  private loadURL(window: BrowserWindow, route: string) {
    console.log("[WindowManager] loadURL called:", {
      route,
      devMode: !!this.devServerUrl,
    });

    if (this.devServerUrl) {
      const url = `${this.devServerUrl}${route}`;
      console.log("[WindowManager] Loading dev URL:", url);

      window.loadURL(url).catch((err) => {
        console.error("[WindowManager] Failed to load URL:", err);
      });
    } else {
      const distPath = path.join(process.env.APP_ROOT!, "dist", "index.html");
      console.log("[WindowManager] Loading file:", distPath);

      window
        .loadFile(distPath)
        .then(() => {
          console.log("[WindowManager] File loaded successfully");
          if (route !== "/") {
            window.webContents.executeJavaScript(`
              window.history.pushState(null, '', '${route}');
              window.dispatchEvent(new PopStateEvent('popstate'));
            `);
          }
        })
        .catch((err) => {
          console.error("[WindowManager] Failed to load file:", err);
        });
    }
  }

  findWindowByWebContentsId(webContentsId: number): BrowserWindow | null {
    if (this.mainWindow?.webContents.id === webContentsId) {
      return this.mainWindow;
    }

    for (const win of this.windows.values()) {
      if (win.webContents.id === webContentsId) {
        return win;
      }
    }

    return null;
  }

  getMainWindow() {
    return this.mainWindow;
  }

  getWindow(id: string) {
    return this.windows.get(id);
  }

  getAllWindows() {
    return Array.from(this.windows.values());
  }

  closeWindow(id: string) {
    const win = this.windows.get(id);
    console.log(this.windows.size);
    win?.close();
    if (this.windows.size === 0) {
      app.quit();
    }
  }

  closeAllWindows() {
    this.windows.forEach((win) => win.close());
    this.mainWindow?.close();
  }
}
