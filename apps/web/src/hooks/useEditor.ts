import { useContext } from "react";
import { Context } from "../core/context";
import { EditorContext } from "../context/EditorContext";

/**
 * Context를 사용하는 커스텀 훅
 * @returns Context 인스턴스
 * @throws Error - Provider 밖에서 사용 시 에러 발생
 *
 * @example
 * const context = useEditor();
 * const scene = context.scene;
 *
 * @example
 * // 구조 분해 할당 사용
 * const { scene, scenes, camera } = useEditor();
 */
export const useEditor = (): Context => {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error("useEditor must be used within ContextProvider");
  }

  return context;
};
