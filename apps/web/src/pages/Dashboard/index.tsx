import { useEffect, useState } from "react";

import { useWindow } from "../../hooks/useWindow";
import DashboardLeft from "./Left/DashboardLeft";
import DashboardRight from "./Right/DashboardRight";

export default function Dashboard() {
  const { setLoginSize } = useWindow();

  const [activeTab, setActiveTab] = useState<string>("Project");

  const handleClickTab = (tab: string) => {
    setActiveTab(tab);
  };
  useEffect(() => {
    setLoginSize();
  }, []);

  return (
    <div
      className="flex flex-1 min-h-0 overflow-hidden max-h-full"
      style={{
        minHeight: "100%",
        height: "0",
      }}
    >
      <DashboardLeft activeTab={activeTab} onClickTab={handleClickTab} />
      <DashboardRight activeTab={activeTab} />
    </div>
  );
}
