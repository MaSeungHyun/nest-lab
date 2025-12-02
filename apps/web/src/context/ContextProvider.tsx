import { ReactNode } from "react";
import { Context } from "../core/context";
import { EditorContext } from "./EditorContext";

// Context 인스턴스 생성
const contextInstance = Context.getInstance();

interface ContextProviderProps {
  children: ReactNode;
}

/**
 * Context Provider 컴포넌트
 * Context 인스턴스를 React Context로 제공
 */
export const ContextProvider = ({ children }: ContextProviderProps) => {
  return (
    <EditorContext.Provider value={contextInstance}>
      {children}
    </EditorContext.Provider>
  );
};
