import { TrendingUp, TrendingDown, ArrowRight, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulation } from "@/context/SimulationContext";
import { useMemo } from "react";

type Trend = "Increasing" | "Stable" | "Decreasing";

const trendConfig = {
  Increasing: {
    icon: TrendingUp,
    arrow: "↑",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    glow: "shadow-[0_0_20px_hsl(0,72%,55%,0.15)]",
    gradient: "from-destructive/20 via-destructive/5 to-transparent",
    label: "Crowd is expected to grow",
  },
  Stable: {
    icon: ArrowRight,
    arrow: "→",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    glow: "shadow-[0_0_20px_hsl(152,60%,48%,0.15)]",
    gradient: "from-success/20 via-success/5 to-transparent",
    label: "No significant change expected",
  },
  Decreasing: {
    icon: TrendingDown,
    arrow: "↓",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    glow: "shadow-[0_0_20px_hsl(168,80%,50%,0.15)]",
    gradient: "from-primary/20 via-primary/5 to-transparent",
    label: "Crowd is expected to thin out",
  },
} as const;

const CrowdPredictionCard = () => {
  const { trendData, crowdCount } = useSimulation();

  const trend: Trend = useMemo(() => {
    if (trendData.length < 4) return "Stable";
    const recent = trendData.slice(-4).map((p) => p.actual);
    const diffs = recent.slice(1).map((v, i) => v - recent[i]);
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    if (avgDiff > 2) return "Increasing";
    if (avgDiff < -2) return "Decreasing";
    return "Stable";
  }, [trendData]);

  const predictedCount = useMemo(() => {
    const delta = trend === "Increasing" ? Math.round(Math.random() * 8 + 5) : trend === "Decreasing" ? -Math.round(Math.random() * 8 + 5) : Math.round(Math.random() * 4 - 2);
    return Math.max(5, Math.min(100, crowdCount + delta));
  }, [trend, crowdCount]);

  const cfg = trendConfig[trend];
  const Icon = cfg.icon;

  return (
    <div className={`relative bg-card rounded-xl border ${cfg.border} p-5 shadow-[var(--shadow-card)] ${cfg.glow} transition-all duration-500 overflow-hidden`}>
      {/* Gradient background accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} pointer-events-none`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${cfg.bg}`}>
              <Brain className={`h-4 w-4 ${cfg.color}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Crowd Prediction</h3>
              <p className="text-[10px] text-muted-foreground">Next 5 Minutes</p>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
            AI Forecast
          </div>
        </div>

        {/* Trend display */}
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={trend}
              className={`flex items-center justify-center w-16 h-16 rounded-2xl ${cfg.bg} border ${cfg.border}`}
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Icon className={`h-8 w-8 ${cfg.color}`} />
            </motion.div>
          </AnimatePresence>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={trend}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-display font-bold ${cfg.color}`}>{trend}</span>
                  <span className={`text-lg ${cfg.color}`}>{cfg.arrow}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{cfg.label}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Predicted value */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Predicted count:</span>
            <motion.span
              key={predictedCount}
              className="text-sm font-display font-bold text-foreground tabular-nums"
              initial={{ opacity: 0.5, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ~{predictedCount}
            </motion.span>
            <span className="text-[10px] text-muted-foreground">persons</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-muted-foreground">Updating live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrowdPredictionCard;
