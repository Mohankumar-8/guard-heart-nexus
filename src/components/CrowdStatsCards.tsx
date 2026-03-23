import { Users, Gauge } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulation } from "@/context/SimulationContext";
import { useEffect, useState } from "react";

const densityConfig = {
  Low: { color: "text-success", bg: "bg-success/15", barWidth: "33%", barColor: "bg-success" },
  Medium: { color: "text-warning", bg: "bg-warning/15", barWidth: "66%", barColor: "bg-warning" },
  High: { color: "text-destructive", bg: "bg-destructive/15", barWidth: "90%", barColor: "bg-destructive" },
} as const;

const CrowdStatsCards = () => {
  const { crowdCount, density } = useSimulation();
  const [displayCount, setDisplayCount] = useState(crowdCount);

  useEffect(() => {
    if (displayCount === crowdCount) return;
    const step = crowdCount > displayCount ? 1 : -1;
    const timer = setTimeout(() => setDisplayCount((d) => d + step), 30);
    return () => clearTimeout(timer);
  }, [crowdCount, displayCount]);

  const cfg = densityConfig[density];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Crowd Count */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glow)] transition-shadow duration-300">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current People Count</p>
            <div className="flex items-baseline gap-2 mt-2">
              <motion.span
                key={displayCount}
                className="text-4xl font-display font-bold tabular-nums text-foreground"
                initial={{ opacity: 0.6, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                {displayCount}
              </motion.span>
              <span className="text-xs text-muted-foreground">persons</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[11px] text-muted-foreground">Live tracking</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Density Level */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glow)] transition-shadow duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Density Level</p>
            <div className="mt-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={density}
                  className={`inline-flex items-center gap-2 text-3xl font-display font-bold ${cfg.color}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                >
                  {density}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${cfg.barColor}`}
                animate={{ width: cfg.barWidth }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">Low</span>
              <span className="text-[10px] text-muted-foreground">High</span>
            </div>
          </div>
          <div className={`p-3 rounded-lg ${cfg.bg} ${cfg.color} ml-4`}>
            <Gauge className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrowdStatsCards;
