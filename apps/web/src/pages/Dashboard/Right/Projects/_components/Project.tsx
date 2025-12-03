import React from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../../../components/Icon";

import { useWindow } from "../../../../../hooks/useWindow";
import { WINDOW_SIZE } from "../../../../../../electron/constants/window";
import { isElectron } from "../../../../../utils/environment";
import { ProjectDto } from "../../DashboardRight";
import { cn } from "../../../../../utils/style";

type ProjectProps = {
  project: ProjectDto;
};

export default function Project({ project }: ProjectProps) {
  const navigate = useNavigate();
  const { createWindow } = useWindow();

  const handleClickProjectDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 요소로 이벤트 전파 방지
  };

  const handleClickProjectOpen = () => {
    isElectron()
      ? createWindow({
          route: `/editor`,
          width: WINDOW_SIZE.LOGIN.width,
          height: WINDOW_SIZE.LOGIN.height,
          resizable: true,
          center: true,
          frame: false,
        })
      : navigate(`/editor`);
  };

  return (
    <div
      className="overflow-hidden w-full h-full flex items-center justify-center"
      onClick={handleClickProjectOpen}
    >
      <div className="relative bg-gray-800/20 w-full h-full flex flex-col flex-1 group hover:cursor-pointer hover:bg-gray-800/30 border border-gray-500 rounded-md hover:border-cyan-300">
        <div className="flex flex-1 items-center justify-center">
          <Icon
            icon="Box"
            size={128}
            className="w-fit brightness-180 stroke-gray-500 group-hover:stroke-white stroke-1"
          />
        </div>
        <div>
          <h1 className="text-lg font-bold group-hover:text-cyan-300 px-1 whitespace-nowrap text-ellipsis overflow-hidden">
            {project.name}
          </h1>
          <span
            className={cn(
              "text-sm text-gray-400 px-1 gap-2",
              isExpired(project.deadline) && "text-red-500"
            )}
          >
            {isExpired(project.deadline) && <span className="mr-1">⚠️</span>}
            <span>
              Due Date : {new Date(project.deadline).toLocaleDateString()}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function isExpired(deadline: Date) {
  return new Date(deadline) < new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
}
