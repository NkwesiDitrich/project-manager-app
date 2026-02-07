import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";
import type { LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: { title: string; href: string; icon: LucideIcon }[];
  isCollapsed: boolean;
  currentWorkspace: Workspace | null;
  className?: string;
  onNavigate?: () => void;
}

export const SidebarNav = ({
  items,
  isCollapsed,
  className,
  currentWorkspace,
  onNavigate,
  ...props
}: SidebarNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={cn("flex flex-col gap-0.5", className)} {...props}>
      {items.map((el) => {
        const Icon = el.icon;
        const isActive = location.pathname === el.href;

        const handleClick = () => {
          if (el.href === "/workspaces") {
            navigate(el.href);
          } else if (currentWorkspace?._id) {
            navigate(`${el.href}?workspaceId=${currentWorkspace._id}`);
          } else {
            navigate(el.href);
          }
          onNavigate?.();
        };

        return (
          <button
            key={el.href}
            type="button"
            onClick={handleClick}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] font-medium transition-colors",
              isCollapsed ? "justify-center px-0" : "w-full",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
            )}
          >
            <Icon className="size-[18px] shrink-0" />
            {!isCollapsed && <span className="truncate">{el.title}</span>}
            {isCollapsed && <span className="sr-only">{el.title}</span>}
          </button>
        );
      })}
    </nav>
  );
};
