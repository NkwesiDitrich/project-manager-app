/**
 * App shell for logged-in users: sidebar, header (workspace switcher, user menu), and main content.
 * Loads workspaces once for the layout; child routes render inside the Outlet.
 */
import { Header } from "@/components/layout/header";
import { SidebarComponent } from "@/components/layout/sidebar-component";
import { Loader } from "@/components/loader";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { fetchData } from "@/lib/fetch-util";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLoaderData, useLocation } from "react-router";

/** Preload workspaces for the layout so header and sidebar can use them without extra requests. */
export const clientLoader = async () => {
  try {
    const [workspaces] = await Promise.all([
      fetchData<Workspace[]>("/workspaces"),
    ]);
    return { workspaces };
  } catch (error) {
    console.log(error);
    return { workspaces: [] };
  }
};

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { workspaces } = useLoaderData() as { workspaces: Workspace[] };
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );

  const location = useLocation();
  useEffect(() => {
    if (!workspaces || workspaces.length === 0) return;
    const searchParams = new URLSearchParams(location.search);
    const workspaceIdFromUrl = searchParams.get("workspaceId");
    if (workspaceIdFromUrl && workspaceIdFromUrl !== "null") {
      const matched = workspaces.find((ws) => ws._id === workspaceIdFromUrl);
      if (matched) setCurrentWorkspace(matched);
    }
  }, [workspaces, location.search]);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }

  const handleWorkspaceSelected = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    try {
      window.localStorage.setItem("selectedWorkspaceId", workspace._id);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex h-screen w-full min-w-0 bg-background overflow-hidden">
      <SidebarComponent
        currentWorkspace={currentWorkspace}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header
          onWorkspaceSelected={handleWorkspaceSelected}
          selectedWorkspace={currentWorkspace}
          onCreateWorkspace={() => setIsCreatingWorkspace(true)}
          workspaces={workspaces}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </div>
  );
};

export default DashboardLayout;
