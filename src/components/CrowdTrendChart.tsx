import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useSimulation } from "@/context/SimulationContext";
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
  const chartData = useMemo(() => addPredictions(trendData as any), [trendData]);

  return (
    <motion.div
      className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Crowd Trend (Last 10 Minutes)
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] text-muted-foreground">Auto-updating</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(168, 80%, 50%)" />
              <stop offset="100%" stopColor="hsl(168, 80%, 60%)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} domain={["dataMin - 10", "dataMax + 10"]} />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 16%)", borderRadius: "8px", fontSize: "12px" }}
            labelStyle={{ color: "hsl(210, 20%, 92%)" }}
          />
          <Legend verticalAlign="top" align="right" iconType="line" wrapperStyle={{ fontSize: "11px", color: "hsl(215, 12%, 50%)" }} />
          <Line type="monotone" dataKey="actual" name="Actual" stroke="url(#actualGrad)" strokeWidth={2.5}
            dot={{ r: 3, fill: "hsl(168, 80%, 50%)", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "hsl(168, 80%, 50%)", strokeWidth: 2, stroke: "hsl(220, 18%, 10%)" }}
            connectNulls={false} />
          <Line type="monotone" dataKey="predicted" name="Predicted" stroke="hsl(38, 92%, 55%)" strokeWidth={2}
            strokeDasharray="6 4" dot={{ r: 2.5, fill: "hsl(38, 92%, 55%)", strokeWidth: 0 }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default CrowdTrendChart;
