import { useEffect, useRef } from "react";

import { cn } from "../../utils/style";

import { useWindowStore } from "../../store/window";
import { useEditor } from "../../hooks/useEditor";

export default function Editor({ className }: { className?: string }) {
  const sceneViewRef = useRef<HTMLDivElement>(null);
  const setTitle = useWindowStore((state) => state.setTitle);

  const context = useEditor();

  useEffect(() => {
    setTitle("Grapicar Studio");
    if (sceneViewRef.current) {
      console.time("SceneView Render");
      context.didMount(sceneViewRef.current);
      console.timeEnd("SceneView Render");
    }

    return () => {
      console.log("%cUnMount", "color: red");
      context.dispose();
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col relative">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref={sceneViewRef}
          className={cn(
            "from-black-500 to-black-100 h-full w-full flex-1 rounded-b-lg",
            "bg-[#404040]",
            className
          )}
        />
      </div>
    </div>
  );
}
