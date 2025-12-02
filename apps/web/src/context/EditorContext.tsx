import { createContext } from "react";
import { Context } from "../core/context";

// React Context 생성
export const EditorContext = createContext<Context | null>(null);
