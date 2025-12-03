import { useState } from "react";
import logo from "../../../assets/logo/logo.png";
import Icon from "../../../components/Icon";
import { IconTypes } from "../../../types/icon";
import { cn } from "../../../utils/style";

const TABS_ARRAY = [
  { icon: "Box", label: "Project" },
  { icon: "FilePenLine", label: "Relase Note" },
];

type DashboardLeftProps = {
  activeTab: string;
  onClickTab: (tab: string) => void;
};

export default function DashboardLeft({
  activeTab,
  onClickTab,
}: DashboardLeftProps) {
  return (
    <div className="relative flex-2 flex flex-col min-w-[300px]">
      <div className="flex py-4 flex-col items-center">
        <img src={logo} alt="logo" className="w-1/2 brightness-180" />
      </div>

      <div className="flex flex-col px-2 gap-2 flex-1">
        {TABS_ARRAY.map((tab) => (
          <Tab
            key={tab.label}
            icon={tab.icon as IconTypes}
            label={tab.label}
            active={activeTab === tab.label}
            onClick={() => onClickTab(tab.label)}
          />
        ))}
      </div>

      <div className="flex flex-col px-2 gap-2 py-4">
        <Tab icon="Settings" label="Setting" />
        <Tab label="Grapicar Owner">
          <div className="w-fit aspect-square bg-cyan-500 rounded-full flex items-center justify-center px-1">
            <Icon
              icon="UserRound"
              size={14}
              className="w-fit brightness-180 stroke-gray-500 group-hover:stroke-white stroke-2"
            />
          </div>
        </Tab>
      </div>
    </div>
  );
}

type TabProps = {
  icon?: IconTypes;
  label: string;
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
};
function Tab({ icon, label, active, onClick, children }: TabProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 w-full h-fit group px-6 py-2 hover:bg-gray-800/50 rounded-md cursor-pointer"
      )}
      onClick={onClick}
    >
      {children || (
        <Icon
          icon={icon as IconTypes}
          size={22}
          className={cn(
            "w-fit brightness-180 stroke-gray-500 group-hover:stroke-white stroke-2",
            active && "stroke-white"
          )}
        />
      )}
      <span
        className={cn(
          "text-gray-300 group-hover:text-white",
          active && "text-white"
        )}
      >
        {label}
      </span>
    </div>
  );
}
