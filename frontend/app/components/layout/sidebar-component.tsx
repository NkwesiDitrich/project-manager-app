import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import {
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  ListCheck,
  LogOut,
  MessageCircle,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarNav } from "./sidebar-nav";

export const SidebarComponent = ({
  currentWorkspace,
  mobileOpen = false,
  onMobileClose,
}: {
  currentWorkspace: Workspace | null;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) => {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Workspaces", href: "/workspaces", icon: Users },
    { title: "My Tasks", href: "/my-tasks", icon: ListCheck },
    { title: "Members", href: "/members", icon: Users },
    { title: "Achieved", href: "/achieved", icon: CheckCircle2 },
    { title: "Chat", href: "/chat", icon: MessageCircle },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  const sidebarContent = (
    <>
      <div className="flex h-[56px] items-center justify-between gap-2 px-3 border-b border-sidebar-border">
        <Link
          to="/dashboard"
          className="flex min-w-0 items-center gap-2.5 text-sidebar-foreground hover:text-sidebar-foreground/90"
          onClick={onMobileClose}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold leading-none">T</span>
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-[15px] truncate">Tasco</span>
          )}
        </Link>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent md:flex hidden"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronsRight className="size-4" />
            ) : (
              <ChevronsLeft className="size-4" />
            )}
          </Button>
          {onMobileClose && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
              onClick={onMobileClose}
              aria-label="Close menu"
            >
              <ChevronsLeft className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        <SidebarNav
          items={navItems}
          isCollapsed={isCollapsed}
          className={cn(isCollapsed && "items-center")}
          currentWorkspace={currentWorkspace}
          onNavigate={onMobileClose}
        />
      </ScrollArea>

      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          className={cn(
            "w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isCollapsed && "justify-center size-9"
          )}
          onClick={() => {
            logout();
            onMobileClose?.();
          }}
        >
          <LogOut className="size-4 shrink-0" />
          {!isCollapsed && <span className="ml-2">Log out</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {onMobileClose && (
        <div
          role="button"
          tabIndex={-1}
          aria-hidden="true"
          className={cn(
            "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
            mobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          )}
          onClick={onMobileClose}
          onKeyDown={(e) => e.key === "Escape" && onMobileClose()}
        />
      )}
      <aside
        className={cn(
          "flex flex-col bg-sidebar border-r border-sidebar-border transition-[width,transform] duration-200 ease-out shrink-0 z-50",
          "md:relative md:translate-x-0",
          onMobileClose ? "w-[260px]" : isCollapsed ? "w-[72px]" : "w-[260px]",
          onMobileClose
            ? "fixed inset-y-0 left-0 md:static"
            : "",
          onMobileClose && !mobileOpen
            ? "-translate-x-full md:translate-x-0"
            : onMobileClose && mobileOpen
            ? "translate-x-0"
            : ""
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
