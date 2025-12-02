import { create } from "zustand";
import { ReactNode } from "react";

interface ProgressConfig {
  title?: string;
  description?: string;
  progress?: number;
  footer?: ReactNode;
  icon?: string;
}

interface ProgressState {
  isOpen: boolean;
  config: ProgressConfig;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setProgress: (progress: number) => void;
  setFooter: (footer: ReactNode) => void;
  setIcon: (icon: string) => void;
  open: () => void;
  close: () => void;
  reset: () => void;
}

const defaultConfig: ProgressConfig = {
  title: "",
  description: "",
  progress: undefined,
  footer: undefined,
  icon: undefined,
};

export const useProgressStore = create<ProgressState>((set) => ({
  isOpen: false,
  config: { ...defaultConfig },
  setTitle: (title: string) => {
    set((state) => ({
      config: { ...state.config, title },
    }));
  },
  setDescription: (description: string) => {
    set((state) => ({
      config: { ...state.config, description },
    }));
  },
  setProgress: (progress: number) => {
    set((state) => ({
      config: { ...state.config, progress },
    }));
  },
  setFooter: (footer: ReactNode) => {
    set((state) => ({
      config: { ...state.config, footer },
    }));
  },
  setIcon: (icon: string) => {
    set((state) => ({
      config: { ...state.config, icon },
    }));
  },
  open: () => {
    set({ isOpen: true });
    isProgressOpen = true;
  },
  close: () => {
    set({ isOpen: false });
    isProgressOpen = false;
  },
  reset: () => {
    set({ isOpen: false, config: { ...defaultConfig } });
  },
}));

// Dialog Builder 클래스 - 메서드 체이닝 지원
class ProgressBuilder {
  setTitle(title: string): this {
    useProgressStore.getState().setTitle(title);
    return this;
  }

  setDescription(description: string): this {
    useProgressStore.getState().setDescription(description);
    return this;
  }

  setProgress(progress: number): this {
    useProgressStore.getState().setProgress(progress);
    return this;
  }

  setFooter(footer: ReactNode): this {
    useProgressStore.getState().setFooter(footer);
    return this;
  }

  setIcon(icon: string): this {
    useProgressStore.getState().setIcon(icon);
    return this;
  }

  open(): this {
    useProgressStore.getState().open();
    return this;
  }

  close(): void {
    useProgressStore.getState().close();
  }

  getConfig(): ProgressConfig {
    return useProgressStore.getState().config;
  }
}

// 싱글톤 다이얼로그 인스턴스
let progressInstance: ProgressBuilder | null = null;
let isProgressOpen = false;

// 다이얼로그 인스턴스 반환 (싱글톤)
export const progress = (): ProgressBuilder => {
  if (!progressInstance) {
    progressInstance = new ProgressBuilder();
  }
  // 다이얼로그가 닫혀있을 때만 리셋 (새 다이얼로그 시작 시)
  const currentState = useProgressStore.getState();
  if (!isProgressOpen && !currentState.isOpen) {
    currentState.reset();
  }
  return progressInstance;
};

// 편의 함수
export const closeProgress = () => {
  useProgressStore.getState().close();
};
