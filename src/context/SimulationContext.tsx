import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";

// --- Types ---
export type DensityLevel = "Low" | "Medium" | "High";
export type AlertSeverity = "safe" | "warning" | "critical";
export type DataSource = "api" | "simulation";

export interface SimAlert {
  id: number | string;
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
  dataSource: DataSource;
  loading: boolean;
  error: string | null;
}

// --- Config ---
const API_BASE = "http://localhost:8000";

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

// --- API fetch helpers ---
async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
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
  const [dataSource, setDataSource] = useState<DataSource>("simulation");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiAvailable = useRef(false);
  const failCount = useRef(0);

  // --- Check API availability on mount ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
        if (!cancelled && res.ok) {
          apiAvailable.current = true;
          setDataSource("api");
          failCount.current = 0;
        }
      } catch {
        // API not available — stay on simulation
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // --- API polling tick ---
  const apiTick = useCallback(async () => {
    try {
      // Fetch all three endpoints in parallel
      const [countRes, alertsRes, historyRes] = await Promise.all([
        apiFetch<{ count: number; density: DensityLevel }>("/current-count"),
        apiFetch<{ alerts: Array<{ id: string; message: string; severity: AlertSeverity; location: string; timestamp: string }> }>("/alerts"),
        apiFetch<{ data: Array<{ count: number; density: string; timestamp: string }> }>("/history"),
      ]);

      setCrowdCount(countRes.count);

      // Map API alerts to SimAlert format
      setAlerts(
        alertsRes.alerts.slice(0, 15).map((a) => ({
          id: a.id,
          message: a.message,
          severity: a.severity,
          location: a.location,
          timestamp: new Date(a.timestamp),
        }))
      );

      // Map history to trend data
      if (historyRes.data.length > 0) {
        const trend: TrendPoint[] = historyRes.data.slice(-10).map((h) => ({
          time: formatTime(new Date(h.timestamp)),
          actual: h.count,
          predicted: null,
        }));
        setTrendData(trend);
      }

      failCount.current = 0;
      setError(null);
    } catch (err) {
      failCount.current++;
      // After 3 consecutive failures, fall back to simulation
      if (failCount.current >= 3) {
        console.warn("API unreachable after 3 attempts, switching to simulation");
        apiAvailable.current = false;
        setDataSource("simulation");
        setError("Backend disconnected — running simulation");
      }
    }
  }, []);

  // --- Simulation tick ---
  const simTick = useCallback(() => {
    setCrowdCount((prev) => {
      const meanRevert = (50 - prev) * 0.05;
      const delta = meanRevert + (Math.random() * 14 - 7);
      const next = Math.round(Math.max(5, Math.min(100, prev + delta)));

      const now = new Date();
      setTrendData((td) => [
        ...td.slice(1),
        { time: formatTime(now), actual: next, predicted: null },
      ]);

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

  // --- Main polling loop ---
  useEffect(() => {
    if (loading) return;

    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 2000 + Math.random() * 1000;
      timeout = setTimeout(async () => {
        if (apiAvailable.current && dataSource === "api") {
          await apiTick();
        } else {
          simTick();
        }
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, [loading, dataSource, apiTick, simTick]);

  const density = getDensity(crowdCount);

  return (
    <SimulationContext.Provider value={{ crowdCount, density, trendData, alerts, dataSource, loading, error }}>
      {children}
    </SimulationContext.Provider>
  );
}
