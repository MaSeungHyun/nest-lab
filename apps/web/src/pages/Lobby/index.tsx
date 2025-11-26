import { useEffect } from "react";
import LobbyLeft from "./Left/LobbyLeft";
import LobbyRight from "./Right/LobbyRight";

export default function Dashboard() {
  useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.send("window-set-main-window-size");
    }
  }, []);

  return (
    <div className="flex flex-1 overflow-hidden">
      <LobbyLeft />
      <LobbyRight />
    </div>
  );
}
