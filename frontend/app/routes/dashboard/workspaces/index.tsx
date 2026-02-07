import { Loader } from "@/components/loader";
import { NoDataFound } from "@/components/no-data-found";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { WorkspaceAvatar } from "@/components/workspace/workspace-avatar";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import type { Workspace } from "@/types";
import { format } from "date-fns";
import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

const Workspaces = () => {
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const { data: workspaces = [], isLoading } = useGetWorkspacesQuery() as {
    data: Workspace[] | undefined;
    isLoading: boolean;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create and manage your workspaces
            </p>
          </div>
          <Button
            onClick={() => setIsCreatingWorkspace(true)}
            size="lg"
            className="gap-2"
          >
            <Plus className="size-4" />
            New workspace
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <WorkspaceCard key={ws._id} workspace={ws} />
          ))}

          {workspaces.length === 0 && (
            <NoDataFound
              title="No workspaces"
              description="Create a workspace to organize projects and collaborate."
              buttonText="Create workspace"
              buttonAction={() => setIsCreatingWorkspace(true)}
            />
          )}
        </div>
      </div>

      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </>
  );
};

const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => {
  return (
    <Link to={`/workspaces/${workspace._id}`} className="block transition-transform hover:-translate-y-0.5">
      <Card className="h-full overflow-hidden border-border transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <WorkspaceAvatar name={workspace.name} color={workspace.color} />
              <div className="min-w-0">
                <CardTitle className="truncate text-base">
                  {workspace.name}
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {format(new Date(workspace.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="size-4 shrink-0" />
              <span className="text-xs font-medium">{workspace.members?.length ?? 0}</span>
            </div>
          </div>
          <CardDescription className="mt-2 line-clamp-2">
            {workspace.description || "No description"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            View details and projects
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Workspaces;
