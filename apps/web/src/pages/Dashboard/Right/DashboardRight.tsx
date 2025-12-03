import Projects from "./Projects/Projects";

type DashboardRightProps = {
  activeTab: string;
};
export default function DashboardRight({ activeTab }: DashboardRightProps) {
  return (
    <div className="flex flex-col flex-8 min-h-0">
      <div className="flex flex-col px-2 py-4 bg-black-700/30 flex-1 min-h-0">
        {activeTab === "Project" ? <Projects /> : <></>}
      </div>
    </div>
  );
}

export type ProjectDto = {
  id: string;
  name: string;
  project_path: string;
  screen_width: number;
  screen_height: number;
  deadline: Date;
  author_id: string;

  created_at: string;
  updated_at: string;
};
