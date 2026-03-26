import { LayoutDashboard, Camera, BarChart3, AlertTriangle, Settings, LogOut, X } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Cameras", icon: Camera, url: "/cameras" },
  { title: "Analytics", icon: BarChart3, url: "/analytics" },
  { title: "Alerts", icon: AlertTriangle, url: "/alerts" },
];

interface AppSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const AppSidebar = ({ open = true, onClose }: AppSidebarProps) => {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-56 shrink-0 border-r border-border bg-[hsl(var(--sidebar-background))] flex flex-col h-full
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:transform-none
        `}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-end p-3 lg:hidden">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-3">
            Menu
          </p>
          {menuItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              className="flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg text-sm text-[hsl(var(--sidebar-foreground))] hover:bg-secondary transition-colors"
              activeClassName="bg-primary/10 text-primary font-medium"
              onClick={onClose}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <button className="flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors w-full">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors w-full">
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
