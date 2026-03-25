// --- Crowd Monitoring API Service ---
// Placeholders for backend integration. Simulation context remains the active fallback.

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export interface CrowdDataResponse {
  crowdCount: number;
  density: "Low" | "Medium" | "High";
  trendData: { time: string; actual: number; predicted: number | null }[];
}

export interface AlertResponse {
  id: number;
  message: string;
  severity: "safe" | "warning" | "critical";
  location: string;
  timestamp: string;
}

// --- REST endpoints ---

export async function fetchCrowdData(): Promise<CrowdDataResponse> {
  if (!API_BASE) throw new Error("API not configured — using simulation fallback");

  const res = await fetch(`${API_BASE}/api/crowd-data`);
  if (!res.ok) throw new Error(`Failed to fetch crowd data: ${res.status}`);
  return res.json();
}

export async function fetchAlerts(): Promise<AlertResponse[]> {
  if (!API_BASE) throw new Error("API not configured — using simulation fallback");

  const res = await fetch(`${API_BASE}/api/alerts`);
  if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.status}`);
  return res.json();
}

// --- WebSocket ---

type WsMessageHandler = (data: CrowdDataResponse | AlertResponse) => void;

let ws: WebSocket | null = null;

export function connectWebSocket(onMessage: WsMessageHandler, onError?: (err: Event) => void) {
  const wsUrl = import.meta.env.VITE_WS_URL;
  if (!wsUrl) {
    console.info("[crowdApi] No VITE_WS_URL set — simulation fallback active");
    return null;
  }

  ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {
      console.error("[crowdApi] Failed to parse WS message");
    }
  };

  ws.onerror = (err) => {
    console.error("[crowdApi] WebSocket error", err);
    onError?.(err);
  };

  ws.onclose = () => {
    console.info("[crowdApi] WebSocket closed");
  };

  return ws;
}

export function disconnectWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

export function isBackendConfigured(): boolean {
  return Boolean(API_BASE);
}
