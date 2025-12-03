import { create } from "zustand";

type WindowStore = {
  title: string;
  setTitle: (title: string) => void;
};

export const useWindowStore = create<WindowStore>((set) => ({
  title: "Grapicar Dashboard",
  setTitle: (title: string) => set({ title }),
}));
