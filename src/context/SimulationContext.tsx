import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

// --- Types ---
export type DensityLevel = "Low" | "Medium" | "High";
export type AlertSeverity = "safe" | "warning" | "critical";

export interface SimAlert {
  id: number;
  message: string;
  severity: AlertSeverity;
  location: string;
  timestamp: Date;
}

export interface TrendPoint {
  time: string;
  actual: number;
  predicted: number | null;
}

interface SimulationState {
  crowdCount: number;
  density: DensityLevel;
  trendData: TrendPoint[];
  alerts: SimAlert[];
}

// --- Helpers ---
function getDensity(count: number): DensityLevel {
  if (count < 30) return "Low";
  if (count <= 70) return "Medium";
  return "High";
}

function alertForDensity(density: DensityLevel): { message: string; severity: AlertSeverity } {
  switch (density) {
    case "High":
      return { message: "High crowd density detected", severity: "critical" };
    case "Medium":
      return { message: "Potential congestion risk", severity: "warning" };
    default:
      return { message: "Safe — Normal activity", severity: "safe" };
  }
}

const locations = [
  "Main Entrance", "Hall A", "Hall B", "Zone C North",
  "Gate 2", "Corridor A", "Exit 3", "Parking Lot",
  "Zone D", "Zone A", "Gate 1", "Zone E South",
];

let alertId = 1;

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function generateInitialTrend(): TrendPoint[] {
  const now = Date.now();
  return Array.from({ length: 10 }, (_, i) => {
    const t = new Date(now - (9 - i) * 60_000);
    return {
      time: formatTime(t),
      actual: Math.round(30 + Math.sin(i * 0.5) * 25 + Math.random() * 15),
      predicted: null,
    };
  });
}

function generateInitialAlerts(count: number): SimAlert[] {
  const density = getDensity(count);
  const { message, severity } = alertForDensity(density);
  return Array.from({ length: 4 }, (_, i) => ({
    id: alertId++,
    message,
    severity,
    location: locations[Math.floor(Math.random() * locations.length)],
    timestamp: new Date(Date.now() - (i + 1) * 45_000),
  }));
}

// --- Context ---
const SimulationContext = createContext<SimulationState | null>(null);

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [crowdCount, setCrowdCount] = useState(45);
  const [trendData, setTrendData] = useState<TrendPoint[]>(generateInitialTrend);
  const [alerts, setAlerts] = useState<SimAlert[]>(() => generateInitialAlerts(45));

  const tick = useCallback(() => {
    setCrowdCount((prev) => {
      // Random walk with slight mean-reversion toward 50
      const meanRevert = (50 - prev) * 0.05;
      const delta = meanRevert + (Math.random() * 14 - 7);
      const next = Math.round(Math.max(5, Math.min(100, prev + delta)));

      // Update trend
      const now = new Date();
      setTrendData((td) => [
        ...td.slice(1),
        { time: formatTime(now), actual: next, predicted: null },
      ]);

      // Generate alert based on new density
      const density = getDensity(next);
      const { message, severity } = alertForDensity(density);
      const newAlert: SimAlert = {
        id: alertId++,
        message,
        severity,
        location: locations[Math.floor(Math.random() * locations.length)],
        timestamp: now,
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 15));

      return next;
    });
  }, []);

  useEffect(() => {
    // Random interval between 2-3 seconds
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 2000 + Math.random() * 1000;
      timeout = setTimeout(() => {
        tick();
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, [tick]);

  const density = getDensity(crowdCount);

  return (
    <SimulationContext.Provider value={{ crowdCount, density, trendData, alerts }}>
      {children}
    </SimulationContext.Provider>
  );
}
