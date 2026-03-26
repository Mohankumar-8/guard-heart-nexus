import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";

// --- Types ---
export type DensityLevel = "Low" | "Medium" | "High";
export type AlertSeverity = "safe" | "warning" | "critical";
export type DataSource = "live" | "simulation";
export type ConnectionStatus = "connected" | "connecting" | "disconnected";

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
  connectionStatus: ConnectionStatus;
  loading: boolean;
  error: string | null;
}

// --- Single config variable ---
const BACKEND_URL = "localhost:8000";
const WS_URL = `ws://${BACKEND_URL}/ws/live`;
const HTTP_URL = `http://${BACKEND_URL}`;

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
  const [dataSource, setDataSource] = useState<DataSource>("simulation");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const simTimer = useRef<ReturnType<typeof setTimeout>>();
  const reconnectDelay = useRef(1000);
  const mounted = useRef(true);

  // --- Apply WebSocket message to state ---
  const applyWsMessage = useCallback((msg: any) => {
    if (!mounted.current) return;

    if (msg.count != null) setCrowdCount(msg.count);

    if (msg.alerts && Array.isArray(msg.alerts)) {
      setAlerts(
        msg.alerts.slice(0, 15).map((a: any) => ({
          id: a.id,
          message: a.message,
          severity: a.severity,
          location: a.location,
          timestamp: new Date(a.timestamp),
        }))
      );
    }

    // Update trend from prediction or history
    if (msg.count != null) {
      const now = new Date();
      setTrendData((td) => [
        ...td.slice(1),
        {
          time: formatTime(now),
          actual: msg.count,
          predicted: msg.prediction?.predicted_count ?? null,
        },
      ]);
    }

    setError(null);
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

  // --- Start / stop simulation loop ---
  const startSimulation = useCallback(() => {
    const schedule = () => {
      simTimer.current = setTimeout(() => {
        simTick();
        schedule();
      }, 2000 + Math.random() * 1000);
    };
    schedule();
  }, [simTick]);

  const stopSimulation = useCallback(() => {
    if (simTimer.current) {
      clearTimeout(simTimer.current);
      simTimer.current = undefined;
    }
  }, []);

  // --- WebSocket connection with auto-reconnect ---
  const connectWs = useCallback(() => {
    if (!mounted.current) return;

    // Clean up existing
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      if (wsRef.current.readyState < 2) wsRef.current.close();
    }

    setConnectionStatus("connecting");

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mounted.current) return;
        console.info("[CrowdGuard] WebSocket connected");
        setConnectionStatus("connected");
        setDataSource("live");
        setError(null);
        setLoading(false);
        reconnectDelay.current = 1000; // reset backoff

        // Stop simulation — live data takes over
        stopSimulation();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          applyWsMessage(data);
        } catch {
          console.warn("[CrowdGuard] Failed to parse WS message");
        }
      };

      ws.onerror = () => {
        // onclose will fire after this
      };

      ws.onclose = () => {
        if (!mounted.current) return;
        console.info("[CrowdGuard] WebSocket disconnected");
        setConnectionStatus("disconnected");

        // Switch to simulation fallback
        setDataSource("simulation");
        setError("Backend disconnected — running simulation");
        setLoading(false);
        startSimulation();

        // Auto-reconnect with exponential backoff (max 15s)
        const delay = reconnectDelay.current;
        reconnectDelay.current = Math.min(delay * 1.5, 15000);
        reconnectTimer.current = setTimeout(connectWs, delay);
      };
    } catch {
      // WebSocket constructor can throw if URL is invalid
      setConnectionStatus("disconnected");
      setDataSource("simulation");
      setLoading(false);
      startSimulation();
    }
  }, [applyWsMessage, startSimulation, stopSimulation]);

  // --- Initial connection attempt with HTTP health check first ---
  useEffect(() => {
    mounted.current = true;

    (async () => {
      try {
        const res = await fetch(`${HTTP_URL}/health`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          // Backend is up — connect WebSocket
          connectWs();
          return;
        }
      } catch {
        // Backend not reachable
      }

      // Fallback to simulation
      if (mounted.current) {
        setDataSource("simulation");
        setConnectionStatus("disconnected");
        setLoading(false);
        startSimulation();

        // Keep trying to connect in the background
        reconnectTimer.current = setTimeout(connectWs, 5000);
      }
    })();

    return () => {
      mounted.current = false;
      stopSimulation();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount
        wsRef.current.close();
      }
    };
  }, [connectWs, startSimulation, stopSimulation]);

  const density = getDensity(crowdCount);

  return (
    <SimulationContext.Provider value={{ crowdCount, density, trendData, alerts, dataSource, connectionStatus, loading, error }}>
      {children}
    </SimulationContext.Provider>
  );
}
