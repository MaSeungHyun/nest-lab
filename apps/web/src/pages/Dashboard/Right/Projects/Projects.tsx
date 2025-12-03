import React, { useMemo, useState } from "react";
import Icon from "../../../../components/Icon";
import Input from "../../../../components/Input";
import Project from "./_components/Project";
import { ProjectDto } from "../DashboardRight";

export default function Projects(props) {
  const [search, setSearch] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleClickClearSearch = () => {
    setSearch("");
  };

  const filteredProjects = useMemo(() => {
    if (!search.trim()) {
      return mockProjects;
    }
    return mockProjects.filter((project) =>
      project.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <>
      <div className="relative mb-3 px-1">
        <Icon
          icon="Search"
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 stroke-3"
        />
        <Input
          placeholder="Search Project"
          className="h-7 pl-7 w-full"
          value={search}
          onChange={handleSearchChange}
        />
        {search.length > 0 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 stroke-3 hover:bg-gray-700/50 rounded-md h-full aspect-square flex items-center justify-center">
            <Icon icon="X" size={16} onClick={handleClickClearSearch} />
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <div
          className="grid gap-3 px-1"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 2fr))",
            gridAutoRows: "260px",
            minHeight: "100%",
            height: "0",
          }}
        >
          {filteredProjects.map((project) => (
            <Project key={project.id} project={project as ProjectDto} />
          ))}
        </div>
      </div>
    </>
  );
}

const mockProjects: ProjectDto[] = [
  {
    id: "1",
    name: "Ioniq5 Cluster v2025",
    project_path: "/projects/hyundai/2025/ioniq5",
    screen_width: 1920,
    screen_height: 1080,
    deadline: new Date("2025-12-17"),
    author_id: "user-001",
    created_at: "2025-01-15T10:30:00Z",
    updated_at: "2025-01-20T14:20:00Z",
  },
  {
    id: "2",
    name: "Genesis G90 Cluster for 2027",
    project_path: "/projects/genesis/2027/g90",
    screen_width: 375,
    screen_height: 812,
    deadline: new Date("2026-11-30"),
    author_id: "user-002",
    created_at: "2025-02-01T09:15:00Z",
    updated_at: "2025-02-10T16:45:00Z",
  },
  {
    id: "3",
    name: "Hyundai MOBIS",
    project_path: "/projects/hyundai/2026/mobis",
    screen_width: 2560,
    screen_height: 1440,
    deadline: new Date("2026-10-15"),
    author_id: "user-001",
    created_at: "2025-03-05T11:00:00Z",
    updated_at: "2025-03-12T13:30:00Z",
  },
  {
    id: "4",
    name: "Hyundai HUD for 2027",
    project_path: "/projects/hyundai/2027/hud",
    screen_width: 1024,
    screen_height: 768,
    deadline: new Date("2026-09-20"),
    author_id: "user-003",
    created_at: "2025-04-10T08:20:00Z",
    updated_at: "2025-04-18T15:10:00Z",
  },
  {
    id: "5",
    name: "Digital Tween for 2026",
    project_path: "/projects/SK/2026/DigitalTween",
    screen_width: 1920,
    screen_height: 1080,
    deadline: new Date("2026-08-31"),
    author_id: "user-002",
    created_at: "2025-05-01T12:00:00Z",
    updated_at: "2025-05-15T10:00:00Z",
  },
];
