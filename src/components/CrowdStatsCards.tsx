import { useEffect, useState } from "react";
import { Users, Gauge } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const densityLevels = [
  { label: "Low", color: "text-success", bg: "bg-success/15", border: "border-success/30", barWidth: "33%" },
  { label: "Medium", color: "text-warning", bg: "bg-warning/15", border: "border-warning/30", barWidth: "66%" },
  { label: "High", color: "text-destructive", bg: "bg-destructive/15", border: "border-destructive/30", barWidth: "90%" },
] as const;

function getDensityIndex(count: number) {
  if (count < 400) return 0;
  if (count < 750) return 1;
  return 2;
}

const CrowdStatsCards = () => {
  const [count, setCount] = useState(627);
  const [displayCount, setDisplayCount] = useState(627);

  // Simulate live count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        const delta = Math.floor(Math.random() * 21) - 10; // -10 to +10
        return Math.max(80, Math.min(1200, prev + delta));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Animate displayed number toward target
  useEffect(() => {
    if (displayCount === count) return;
    const step = count > displayCount ? 1 : -1;
    const timer = setTimeout(() => setDisplayCount((d) => d + step), 18);
    return () => clearTimeout(timer);
  }, [count, displayCount]);

  const density = densityLevels[getDensityIndex(count)];

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
                {displayCount.toLocaleString()}
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
                  key={density.label}
                  className={`inline-flex items-center gap-2 text-3xl font-display font-bold ${density.color}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                >
                  {density.label}
                </motion.span>
              </AnimatePresence>
            </div>
            {/* Density bar */}
            <div className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${density.label === "Low" ? "bg-success" : density.label === "Medium" ? "bg-warning" : "bg-destructive"}`}
                animate={{ width: density.barWidth }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">Low</span>
              <span className="text-[10px] text-muted-foreground">High</span>
            </div>
          </div>
          <div className={`p-3 rounded-lg ${density.bg} ${density.color} ml-4`}>
            <Gauge className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrowdStatsCards;
