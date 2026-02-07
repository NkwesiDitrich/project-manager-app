import type { StatsCardProps } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ClipboardList,
  FolderOpen,
  ListTodo,
  Loader2,
} from "lucide-react";

const statConfig = [
  {
    key: "totalProjects" as const,
    title: "Total projects",
    description: "In progress",
    subKey: "totalProjectInProgress" as const,
    icon: FolderOpen,
    accent: "text-primary",
  },
  {
    key: "totalTasks" as const,
    title: "Total tasks",
    description: "Completed",
    subKey: "totalTaskCompleted" as const,
    icon: ClipboardList,
    accent: "text-primary",
  },
  {
    key: "totalTaskToDo" as const,
    title: "To do",
    description: "Waiting",
    subKey: null,
    icon: ListTodo,
    accent: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "totalTaskInProgress" as const,
    title: "In progress",
    description: "Active now",
    subKey: null,
    icon: Loader2,
    accent: "text-primary",
  },
];

export const StatsCard = ({ data }: { data: StatsCardProps }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statConfig.map(({ key, title, description, subKey, icon: Icon, accent }) => (
        <Card key={key} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <Icon className={`size-4 shrink-0 ${accent}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">
              {data[key]}
            </div>
            {subKey && data[subKey] !== undefined && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {data[subKey]} {description.toLowerCase()}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
