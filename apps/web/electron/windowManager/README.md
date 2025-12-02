# WindowManager

Electron 윈도우를 효율적으로 관리하는 매니저 클래스입니다.

## 주요 기능

### 🚀 윈도우 풀링 (Window Pooling)
- 미리 생성된 윈도우를 풀에 보관하여 빠른 윈도우 생성
- 첫 윈도우 생성 시간: ~100ms
- React 앱이 미리 로드되어 즉시 표시 가능

### ♻️ 윈도우 재사용
- 같은 ID의 윈도우 요청 시 자동으로 재사용
- 라우트만 변경하여 전체 리로드 방지
- 메모리 효율적 관리

### ⚡ 성능 최적화
- `backgroundThrottling: false` - 백그라운드에서도 정상 작동
- `show: false` - 준비될 때까지 숨김 (깜빡임 방지)
- `backgroundColor` 설정 - 하얀 화면 방지

## 사용 예시

```typescript
import { WindowManager } from './windowManager';

// 초기화
const windowManager = new WindowManager('http://localhost:5173');

// 메인 윈도우 생성
windowManager.createMainWindow({
  width: 800,
  height: 600
});

// 새 윈도우 생성
windowManager.createWindow('chat-room', '/chat/123', {
  width: 1280,
  height: 720,
  resizable: true
});

// 윈도우 가져오기
const window = windowManager.getWindow('chat-room');

// 윈도우 닫기
windowManager.closeWindow('chat-room');
```

## API 문서

### `createMainWindow(options?)`
메인 윈도우를 생성합니다.

**Parameters:**
- `options` (optional): BrowserWindow 생성 옵션

**Returns:** `BrowserWindow`

---

### `createWindow(id, route, options?)`
새 윈도우를 생성하거나 기존 윈도우를 재사용합니다.

**Parameters:**
- `id`: 윈도우 식별자
- `route`: 라우트 경로 (예: '/login')
- `options` (optional): BrowserWindow 생성 옵션

**Returns:** `BrowserWindow`

---

### `findWindowById(webContentsId)`
WebContents ID로 윈도우를 찾습니다 (IPC 핸들러에서 유용).

**Parameters:**
- `webContentsId`: WebContents의 고유 ID

**Returns:** `BrowserWindow | null`

---

### `getMainWindow()`
메인 윈도우를 반환합니다.

**Returns:** `BrowserWindow | null`

---

### `getWindow(id)`
ID로 윈도우를 가져옵니다.

**Parameters:**
- `id`: 윈도우 식별자

**Returns:** `BrowserWindow | undefined`

---

### `getAllWindows()`
모든 활성 윈도우를 반환합니다.

**Returns:** `BrowserWindow[]`

---

### `closeWindow(id)`
특정 윈도우를 닫습니다.

**Parameters:**
- `id`: 윈도우 식별자

---

### `closeAllWindows()`
모든 윈도우를 닫습니다 (풀 포함).

## 아키텍처

```
┌─────────────────────────────────────────┐
│         WindowManager                    │
├─────────────────────────────────────────┤
│ - windows: Map<string, BrowserWindow>   │
│ - mainWindow: BrowserWindow | null      │
│ - windowPool: BrowserWindow[]           │
├─────────────────────────────────────────┤
│ + createMainWindow()                    │
│ + createWindow()                        │
│ + getWindow()                           │
│ + closeWindow()                         │
│ - initializeWindowPool()                │
│ - getWindowFromPool()                   │
│ - navigateWindow()                      │
└─────────────────────────────────────────┘
         │
         ├── manages ──> Main Window (hub)
         ├── manages ──> Chat Windows
         ├── manages ──> Login Windows
         └── pools ────> Preloaded Windows
```

## 성능 벤치마크

| 동작 | 시간 |
|------|------|
| 첫 윈도우 생성 (풀 사용) | ~100ms |
| 기존 윈도우 재사용 | ~50ms |
| 라우트만 변경 | ~10ms |
| 풀 없이 생성 | ~2-3초 |

## 타입 정의

모든 타입은 `./types.ts`에 정의되어 있습니다:
- `IWindowManager` - WindowManager 인터페이스
- `WindowCreationOptions` - 윈도우 생성 옵션
- `WindowState` - 윈도우 상태
- `WindowPoolConfig` - 풀 설정

