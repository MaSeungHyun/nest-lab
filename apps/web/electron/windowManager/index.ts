// 📄 electron/windowManager/index.ts
import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "node:url";
import { WINDOW_SIZE } from "../constants/window";
import type { WindowManagerInterface } from "./types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class WindowManager implements WindowManagerInterface {
  private windows = new Map<string, BrowserWindow>();
  private mainWindow: BrowserWindow | null = null;
  private windowPool: BrowserWindow[] = []; // 윈도우 풀
  private poolSize = 1; // 미리 생성할 윈도우 수

  constructor(private devServerUrl?: string) {
    console.log("[WindowManager] Initialized with devServerUrl:", devServerUrl);
    console.log("[WindowManager] __dirname:", __dirname);
    console.log("[WindowManager] APP_ROOT:", process.env.APP_ROOT);

    // 앱 준비 후 윈도우 풀 초기화
    app.whenReady().then(() => {
      this.initializeWindowPool();
    });
  }

  // 윈도우 풀 초기화 (백그라운드에서 미리 생성)
  private initializeWindowPool() {
    console.log("[WindowManager] Initializing window pool...");
    for (let i = 0; i < this.poolSize; i++) {
      const win = this.createPooledWindow();
      this.windowPool.push(win);
    }
    console.log(
      `[WindowManager] Window pool initialized with ${this.poolSize} windows`
    );
  }

  // 풀용 윈도우 생성 (숨겨진 상태로)
  private createPooledWindow(): BrowserWindow {
    const preloadPath = path.join(
      process.env.APP_ROOT!,
      "dist-electron",
      "preload.mjs"
    );

    const win = new BrowserWindow({
      width: WINDOW_SIZE.LOGIN.width,
      height: WINDOW_SIZE.LOGIN.height,
      show: false,
      backgroundColor: "#1e1f21",
      frame: false,
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        // 성능 최적화
        backgroundThrottling: false, // 백그라운드에서도 정상 작동
      },
    });

    // 미리 앱 로드
    if (this.devServerUrl) {
      console.log(this.devServerUrl);
      win.loadURL(`${this.devServerUrl}preview`).catch((err) => {
        console.error("[WindowManager] Failed to preload pooled window:", err);
      });
    }

    return win;
  }

  // 풀에서 윈도우 가져오기
  private getWindowFromPool(): BrowserWindow | null {
    if (this.windowPool.length > 0) {
      const win = this.windowPool.pop()!;
      console.log("[WindowManager] Reusing window from pool");

      // 새 윈도우를 풀에 추가 (다음을 위해)
      setTimeout(() => {
        const newWin = this.createPooledWindow();
        this.windowPool.push(newWin);
      });

      return win;
    }
    return null;
  }

  createMainWindow(options?: Electron.BrowserWindowConstructorOptions) {
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
      show: false,
      backgroundColor: "#1e1f21",
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        // 성능 최적화
        backgroundThrottling: false,
        // 보안 강화
        webSecurity: true,
        // 리소스 최적화
        disableHtmlFullscreenWindowResize: true,
      },
    };

    this.mainWindow = new BrowserWindow({ ...defaultOptions, ...options });
    this.windows.set("main", this.mainWindow);
    this.loadURL(this.mainWindow, "/");

    // 준비되면 표시
    this.mainWindow.once("ready-to-show", () => {
      console.log("[WindowManager] Main window ready to show");
      this.mainWindow?.show();
      this.mainWindow?.focus();
    });

    this.mainWindow.on("closed", () => {
      console.log("[WindowManager] Main window closed");
      this.windows.delete("main");
      this.mainWindow = null;

      // 메인 윈도우가 닫혀도 다른 윈도우가 있으면 앱 유지
      if (this.windows.size > 0) {
        console.log(
          "[WindowManager] Other windows still open, keeping app alive"
        );
      }
    });

    return this.mainWindow;
  }

  createWindow(
    id: string,
    route: string,
    options?: Electron.BrowserWindowConstructorOptions
  ) {
    // 이미 존재하는 윈도우면 라우트만 변경하고 포커스
    if (this.windows.has(id)) {
      const activeWindow = this.windows.get(id);
      if (activeWindow && !activeWindow.isDestroyed()) {
        console.log(
          "[WindowManager] Reusing existing window, navigating to:",
          route
        );
        this.navigateWindow(activeWindow, route);
        activeWindow.focus();
        return activeWindow;
      }
    }

    console.log("[WindowManager] Creating new window:", { id, route, options });

    // 풀에서 윈도우 가져오기 (훨씬 빠름!)
    let win = this.getWindowFromPool();

    if (!win) {
      // 풀이 비어있으면 새로 생성
      console.log("[WindowManager] Pool empty, creating new window");
      const preloadPath = path.join(
        process.env.APP_ROOT!,
        "dist-electron",
        "preload.mjs"
      );

      const defaultOptions: Electron.BrowserWindowConstructorOptions = {
        width: WINDOW_SIZE.LOGIN.width,
        height: WINDOW_SIZE.LOGIN.height,
        resizable: true,
        frame: false,
        show: false,
        backgroundColor: "#1e1f21",
        webPreferences: {
          preload: preloadPath,
          contextIsolation: true,
          nodeIntegration: false,
          backgroundThrottling: false,
        },
      };

      win = new BrowserWindow({ ...defaultOptions, ...options });

      this.loadURL(win, route);
    } else {
      // 풀에서 가져온 윈도우는 이미 로드되어 있으므로 라우트만 변경
      console.log("[WindowManager] Using pooled window, navigating to:", route);
      this.navigateWindow(win, route);
    }

    this.windows.set(id, win);

    // 옵션 적용
    if (options) {
      if (options.width || options.height) {
        win.setSize(
          options.width || WINDOW_SIZE.LOGIN.width,
          options.height || WINDOW_SIZE.LOGIN.height
        );
      }
      if (options.resizable !== undefined) {
        win.setResizable(options.resizable);
      }
    }

    // 준비되면 표시
    win.once("ready-to-show", () => {
      console.log("[WindowManager] Window ready to show");
      win.show();
      win.focus();
    });

    // 아직 ready가 되었다면 즉시 표시
    if (win.webContents.getURL()) {
      win.show();
      win.focus();
    }

    win.on("closed", () => {
      console.log("[WindowManager] Window closed:", id);
      this.windows.delete(id);
    });

    return win;
  }

  // 윈도우 라우트 변경 (IPC를 통한 React Router 제어)
  private navigateWindow(window: BrowserWindow, route: string) {
    // XSS 방지를 위해 route 검증
    const safeRoute = route.startsWith("/") ? route : `/${route}`;

    console.log("[WindowManager] Navigating to route:", safeRoute);

    // IPC로 React Router에 직접 전달 (가장 안전하고 React Router와 완벽 통합)
    window.webContents.send("navigate", safeRoute);

    // Fallback: 만약 React가 아직 로드되지 않았다면 기존 방식 사용
    const currentUrl = window.webContents.getURL();
    if (!currentUrl || currentUrl === "about:blank") {
      console.log("[WindowManager] React not loaded yet, using fallback");
      if (this.devServerUrl) {
        window.loadURL(`${this.devServerUrl}${safeRoute}`);
      }
    }
  }

  private loadURL(window: BrowserWindow, route: string) {
    console.log("[WindowManager] loadURL called:", {
      route,
      devMode: !!this.devServerUrl,
    });

    if (this.devServerUrl) {
      const url = `${this.devServerUrl}${route.charAt(0) === "/" ? route.slice(1) : route}`;

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

  findWindowById(id: number): BrowserWindow | null {
    if (this.mainWindow?.webContents.id === id) {
      return this.mainWindow;
    }

    for (const win of this.windows.values()) {
      if (win.webContents.id === id) {
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

    win?.close();

    // 메인 윈도우가 아닌 경우에만 체크
    // 메인 윈도우가 닫혀도 다른 윈도우가 있으면 앱을 유지
    if (id !== "main" && this.windows.size === 0 && !this.mainWindow) {
      // 모든 윈도우가 닫혔고 메인 윈도우도 없으면 종료
      app.quit();
    }
  }

  closeAllWindows() {
    this.windows.forEach((win) => win.close());
    this.mainWindow?.close();

    // 풀의 윈도우도 정리
    this.windowPool.forEach((win) => {
      if (!win.isDestroyed()) {
        win.destroy();
      }
    });
    this.windowPool = [];
  }
}

// 타입 재export
export type {
  WindowManagerInterface,
  WindowCreationOptions,
  WindowState,
  WindowPoolConfig,
} from "./types";
