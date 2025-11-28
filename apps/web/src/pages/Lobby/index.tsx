import { useEffect } from "react";
import LobbyLeft from "./Left/LobbyLeft";
import LobbyRight from "./Right/LobbyRight";
import { useWindow } from "../../hooks/useWindow";

export default function Dashboard() {
  const { setLoginSize } = useWindow();

  useEffect(() => {
    setLoginSize();
  }, []);

  return (
    <div className="flex flex-1 overflow-hidden">
      <LobbyLeft />
      <LobbyRight />
    </div>
  );
}
