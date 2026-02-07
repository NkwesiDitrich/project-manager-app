import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { format } from "date-fns";
import { CheckCircle2, Circle } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export const UpcomingTasks = ({ data }: { data: Task[] }) => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming tasks</CardTitle>
        <CardDescription>Due soon</CardDescription>
      </CardHeader>
      <CardContent className="space-y-0">
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No upcoming tasks
          </p>
        ) : (
          data.map((task) => (
            <Link
              key={task._id}
              to={`/workspaces/${workspaceId}/projects/${task.project}/tasks/${task._id}`}
              className="flex items-start gap-3 border-b border-border py-3 last:border-0 last:pb-0 transition-colors hover:bg-muted/40"
            >
              <div
                className={cn(
                  "mt-0.5 shrink-0 rounded-full p-0.5",
                  task.priority === "High" && "bg-destructive/10 text-destructive",
                  task.priority === "Medium" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  task.priority === "Low" && "bg-muted text-muted-foreground"
                )}
              >
                {task.status === "Done" ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Circle className="size-4" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-medium text-sm text-foreground line-clamp-1">
                  {task.title}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{task.status}</span>
                  {task.dueDate && (
                    <>
                      <span>·</span>
                      <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
};
