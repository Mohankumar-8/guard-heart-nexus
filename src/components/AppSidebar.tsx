import { LayoutDashboard, Camera, BarChart3, AlertTriangle, Settings, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Cameras", icon: Camera, url: "/cameras" },
  { title: "Analytics", icon: BarChart3, url: "/analytics" },
  { title: "Alerts", icon: AlertTriangle, url: "/alerts" },
];

const AppSidebar = () => {
  return (
    <aside className="w-56 shrink-0 border-r border-border bg-[hsl(var(--sidebar-background))] flex flex-col h-full">
      <nav className="flex-1 py-4 px-3 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-3">
          Menu
        </p>
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[hsl(var(--sidebar-foreground))] hover:bg-secondary transition-colors"
            activeClassName="bg-primary/10 text-primary font-medium"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors w-full">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors w-full">
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
