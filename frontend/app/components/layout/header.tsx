import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { Bell, Menu, Plus } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/hooks/use-notifications";

interface HeaderProps {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
  workspaces: Workspace[];
  onMenuClick?: () => void;
}

export const Header = ({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkspace,
  workspaces = [],
  onMenuClick,
}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isOnWorkspacePage = useLocation().pathname.includes("/workspace");

  const { data: notifications = [] } = useNotificationsQuery();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const { mutate: markRead } = useMarkNotificationReadMutation();
  const { mutate: markAllRead } = useMarkAllNotificationsReadMutation();

  const handleWorkspaceClick = (workspace: Workspace) => {
    onWorkspaceSelected(workspace);
    if (isOnWorkspacePage) {
      navigate(`/workspaces/${workspace._id}`);
    } else {
      const basePath = window.location.pathname;
      navigate(`${basePath}?workspaceId=${workspace._id}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 sm:gap-4 border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6 lg:px-8">
      <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground md:hidden"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-9 min-w-0 gap-2 rounded-lg border-border/80 bg-background px-3 font-medium text-foreground hover:bg-muted/50 hover:border-border"
            >
              {selectedWorkspace ? (
                <>
                  <WorkspaceAvatar
                    color={selectedWorkspace.color}
                    name={selectedWorkspace.name}
                  />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {selectedWorkspace.name}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">Select workspace</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 rounded-xl">
            <DropdownMenuLabel className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Workspaces
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws._id}
                  onClick={() => handleWorkspaceClick(ws)}
                  className="gap-2 rounded-lg py-2"
                >
                  <WorkspaceAvatar color={ws.color} name={ws.name} />
                  <span className="truncate">{ws.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onCreateWorkspace}
              className="gap-2 rounded-lg py-2 text-primary focus:text-primary"
            >
              <Plus className="size-4" />
              Create workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative size-9 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl">
              <DropdownMenuLabel className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllRead()}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-3 py-4 text-xs text-muted-foreground">
                  No notifications yet.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <button
                      key={notif._id}
                      type="button"
                      onClick={() => markRead(notif._id)}
                      className={`flex w-full items-start gap-2 px-3 py-2 text-left text-sm ${
                        notif.isRead ? "bg-background" : "bg-muted/60"
                      } hover:bg-muted`}
                    >
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <div className="text-xs font-semibold">
                          {notif.title}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {notif.message}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Account menu"
              >
                <Avatar className="size-8 rounded-lg border border-border">
                  <AvatarImage src={user?.profilePicture} alt={user?.name} />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              <DropdownMenuLabel className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/user/profile" className="rounded-lg py-2 cursor-pointer">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="rounded-lg py-2 text-destructive focus:text-destructive cursor-pointer"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
