import { safeIpcSend } from "../utils/environment";
import { cn } from "../utils/style";
import Icon from "./Icon";

import { useWindowStore } from "../store/window";

export default function TitleBar() {
  const title = useWindowStore((state) => state.title);
  const handleMinimize = () => {
    safeIpcSend("window-minimize");
  };

  const handleMaximize = () => {
    safeIpcSend("window-maximize");
  };

  const handleClose = () => {
    safeIpcSend("window-close");
  };

  return (
    <div
      style={
        {
          WebkitAppRegion: "drag",
        } as React.CSSProperties
      }
      className="relative top-0 left-0 right-0 min-h-[30px] bg-black-900 flex items-center justify-between select-none z-9999"
    >
      <div
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        className="flex items-center px-3"
      >
        {/* <img src={logo} alt="logo" className="w-4 h-4" /> */}
      </div>
      {/* 앱 타이틀 */}
      <div className="absolute left-1/2 -translate-x-1/2 text-xs text-[#b7b7b7]">
        {title}
      </div>

      {/* 윈도우 컨트롤 버튼 */}
      <div
        className="flex h-full items-center relative"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className={cn(
            "px-4 hover:bg-zinc-700 transition-colors flex items-center justify-center h-full"
          )}
        >
          <Icon icon="Minus" size={16} className="text-gray-300" />
        </button>
        <button
          onClick={handleMaximize}
          className={cn(
            "px-4 hover:bg-zinc-700 transition-colors flex items-center justify-center h-full"
          )}
        >
          <Icon icon="Square" size={14} className="text-gray-300" />
        </button>
        <button
          onClick={handleClose}
          className={cn(
            "px-4 hover:bg-red-600 transition-colors flex items-center justify-center h-full"
          )}
        >
          <Icon icon="X" size={16} className="text-gray-300" />
        </button>
      </div>
    </div>
  );
}
