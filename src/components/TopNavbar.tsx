import { Bell, Search, Shield } from "lucide-react";

const TopNavbar = () => {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-display font-bold tracking-tight text-foreground">
          CrowdGuard <span className="text-primary">AI</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-48"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">AD</span>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
