import { BrowserWindow } from "electron";

export interface WindowManagerInterface {
  /**
   * 메인 윈도우 생성
   * @param options - BrowserWindow 생성 옵션
   * @returns 생성된 메인 윈도우
   */
  createMainWindow(
    options?: Electron.BrowserWindowConstructorOptions
  ): BrowserWindow;

  /**
   * 새 윈도우 생성 또는 기존 윈도우 재사용
   * @param id - 윈도우 식별자
   * @param route - 라우트 경로 (예: '/login', '/dashboard')
   * @param options - BrowserWindow 생성 옵션
   * @returns 생성되거나 재사용된 윈도우
   */
  createWindow(
    id: string,
    route: string,
    options?: Electron.BrowserWindowConstructorOptions
  ): BrowserWindow;

  /**
   * WebContents ID로 윈도우 찾기
   * @param webContentsId - WebContents의 고유 ID
   * @returns 찾은 윈도우 또는 null
   * ipc 통신이 이루어지는 id를 받아서 윈도우를 찾는다.
   */
  findWindowById(webContentsId: number): BrowserWindow | null;

  /**
   * 메인 윈도우 가져오기
   * @returns 메인 윈도우 또는 null
   */
  getMainWindow(): BrowserWindow | null;

  /**
   * ID로 윈도우 가져오기
   * @param id - 윈도우 식별자
   * @returns 윈도우 또는 undefined
   */
  getWindow(id: string): BrowserWindow | undefined;
  /**
   * 모든 활성 윈도우 가져오기
   * @returns 모든 윈도우 배열
   */
  getAllWindows(): BrowserWindow[];

  /**
   * 특정 윈도우 닫기
   * @param id - 윈도우 식별자
   */
  closeWindow(id: string): void;

  /**
   * 모든 윈도우 닫기 (메인 윈도우 포함)
   */
  closeAllWindows(): void;
}

/**
 * 윈도우 생성 옵션 확장
 */
export interface WindowCreationOptions
  extends Electron.BrowserWindowConstructorOptions {
  /**
   * 초기 라우트 경로
   */
  route?: string;
}

/**
 * 윈도우 상태
 */
export interface WindowState {
  /**
   * 윈도우 ID
   */
  id: string;

  /**
   * 현재 라우트
   */
  route: string;

  /**
   * 윈도우 크기
   */
  size: {
    width: number;
    height: number;
  };

  /**
   * 표시 여부
   */
  visible: boolean;

  /**
   * 포커스 여부
   */
  focused: boolean;

  /**
   * 최대화 여부
   */
  maximized: boolean;
}

/**
 * 윈도우 풀 설정
 */
export interface WindowPoolConfig {
  /**
   * 풀에 유지할 윈도우 수
   * @default 1
   */
  size: number;

  /**
   * 풀 윈도우 미리 로드 여부
   * @default true
   */
  preload: boolean;

  /**
   * 풀 초기화 지연 시간 (ms)
   * @default 0
   */
  initDelay: number;
}
