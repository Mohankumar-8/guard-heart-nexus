import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useSimulation } from "@/context/SimulationContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { useMemo } from "react";

function addPredictions(data: { time: string; actual: number; predicted: number | null }[]) {
  const last = data[data.length - 1];
  const now = Date.now();
  const predictions = Array.from({ length: 4 }, (_, i) => {
    const t = new Date(now + (i + 1) * 60_000);
    const drift = (i + 1) * (Math.random() * 6 - 2);
    return {
      time: t.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      actual: null as number | null,
      predicted: Math.round(last.actual + drift),
    };
  });
  const bridged = data.map((d, i) =>
    i === data.length - 1 ? { ...d, predicted: d.actual } : d
  );
  return [...bridged, ...predictions];
}

const CrowdTrendChart = () => {
  const { trendData } = useSimulation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const chartData = useMemo(() => addPredictions(trendData as any), [trendData]);

  const gridColor = isDark ? "hsl(220, 14%, 16%)" : "hsl(210, 15%, 90%)";
  const tickColor = isDark ? "hsl(215, 12%, 50%)" : "hsl(215, 12%, 55%)";
  const tooltipBg = isDark ? "hsl(220, 18%, 10%)" : "hsl(0, 0%, 100%)";
  const tooltipBorder = isDark ? "hsl(220, 14%, 16%)" : "hsl(210, 15%, 88%)";
  const tooltipLabel = isDark ? "hsl(210, 20%, 92%)" : "hsl(220, 20%, 10%)";

  return (
    <motion.div
      className="bg-card rounded-xl border border-border p-4 md:p-5 shadow-[var(--shadow-card)]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-sm md:text-base text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Crowd Trend (Last 10 Minutes)
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] text-muted-foreground">Auto-updating</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(168, 80%, 50%)" />
              <stop offset="100%" stopColor="hsl(168, 80%, 60%)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} domain={["dataMin - 10", "dataMax + 10"]} />
          <Tooltip
            contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "8px", fontSize: "12px" }}
            labelStyle={{ color: tooltipLabel }}
          />
          <Legend verticalAlign="top" align="right" iconType="line" wrapperStyle={{ fontSize: "11px", color: tickColor }} />
          <Line type="monotone" dataKey="actual" name="Actual" stroke="url(#actualGrad)" strokeWidth={2.5}
            dot={{ r: 3, fill: "hsl(168, 80%, 50%)", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "hsl(168, 80%, 50%)", strokeWidth: 2, stroke: tooltipBg }}
            connectNulls={false} />
          <Line type="monotone" dataKey="predicted" name="Predicted" stroke="hsl(38, 92%, 55%)" strokeWidth={2}
            strokeDasharray="6 4" dot={{ r: 2.5, fill: "hsl(38, 92%, 55%)", strokeWidth: 0 }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default CrowdTrendChart;
