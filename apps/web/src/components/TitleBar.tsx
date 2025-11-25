import { cn } from "../utils/style";
import Icon from "./Icon";

export default function TitleBar() {
  const handleMinimize = () => {
    window.ipcRenderer.send("window-minimize");
  };

  const handleMaximize = () => {
    window.ipcRenderer.send("window-maximize");
  };

  const handleClose = () => {
    window.ipcRenderer.send("window-close");
  };

  const handleClickBack = () => {
    history.back();
  };

  const handleClickForward = () => {
    history.forward();
  };

  return (
    <div
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      className="fixed top-0 left-0 right-0 h-8 bg-zinc-900 flex items-center justify-between select-none z-50"
    >
      <div
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        className="flex items-center gap-4 px-2 md:px-2 lg:px-2"
      >
        <div className="group hover:cursor-pointer" onClick={handleClickBack}>
          <Icon
            icon="ArrowLeft"
            size={16}
            className="text-gray-300 group-hover:stroke-white"
          />
        </div>
        <div
          className="hover:cursor-pointer group"
          onClick={handleClickForward}
        >
          <Icon
            icon="ArrowRight"
            size={16}
            className="text-gray-300  group-hover:stroke-white"
          />
        </div>
      </div>
      {/* 앱 타이틀 */}
      <div className="flex items-center gap-2 px-4">
        <span className="text-sm text-gray-300 font-semibold">
          {/* Grapicar Messenger */}
        </span>
      </div>

      {/* 윈도우 컨트롤 버튼 */}
      <div
        className="flex h-full"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className={cn(
            "px-4 hover:bg-zinc-700 transition-colors flex items-center justify-center"
          )}
        >
          <Icon icon="Minus" size={16} className="text-gray-300" />
        </button>
        <button
          onClick={handleMaximize}
          className={cn(
            "px-4 hover:bg-zinc-700 transition-colors flex items-center justify-center"
          )}
        >
          <Icon icon="Square" size={14} className="text-gray-300" />
        </button>
        <button
          onClick={handleClose}
          className={cn(
            "px-4 hover:bg-red-600 transition-colors flex items-center justify-center"
          )}
        >
          <Icon icon="X" size={16} className="text-gray-300" />
        </button>
      </div>
    </div>
  );
}
