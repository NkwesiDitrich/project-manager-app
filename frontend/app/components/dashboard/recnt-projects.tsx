import { getProjectProgress, getTaskStatusColor } from "@/lib";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { Link, useSearchParams } from "react-router";
import { Progress } from "../ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export const RecentProjects = ({ data }: { data: Project[] }) => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent projects</CardTitle>
        <CardDescription>Latest activity across your projects</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No recent projects yet
          </p>
        ) : (
          data.map((project) => {
            const projectProgress = getProjectProgress(project.tasks);
            return (
              <div
                key={project._id}
                className="rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Link
                    to={`/workspaces/${workspaceId}/projects/${project._id}`}
                    className="font-medium text-foreground hover:text-primary hover:underline hover:underline-offset-2"
                  >
                    {project.title}
                  </Link>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-medium",
                      getTaskStatusColor(project.status)
                    )}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                  {project.description}
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{projectProgress}%</span>
                  </div>
                  <Progress value={projectProgress} className="h-2" />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
