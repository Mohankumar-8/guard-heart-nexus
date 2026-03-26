import { Bell, Search, Shield, Menu, Wifi, WifiOff } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useSimulation } from "@/context/SimulationContext";

interface TopNavbarProps {
  onMenuToggle?: () => void;
}

const TopNavbar = ({ onMenuToggle }: TopNavbarProps) => {
  const { dataSource, error } = useSimulation();

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 md:gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>
        )}
        <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        <h1 className="text-base md:text-lg font-display font-bold tracking-tight text-foreground">
          CrowdGuard <span className="text-primary">AI</span>
        </h1>
        {/* Data source indicator */}
        <div className={`hidden sm:flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${
          dataSource === "api"
            ? "bg-success/15 text-success"
            : "bg-warning/15 text-warning"
        }`}>
          {dataSource === "api" ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {dataSource === "api" ? "Live API" : "Simulation"}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {error && (
          <span className="hidden md:block text-[10px] text-warning truncate max-w-[200px]">{error}</span>
        )}
        <div className="hidden md:flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-48"
          />
        </div>
        <ThemeToggle />
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <div className="hidden sm:flex h-8 w-8 rounded-full bg-primary/20 border border-primary/30 items-center justify-center">
          <span className="text-xs font-semibold text-primary">AD</span>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
