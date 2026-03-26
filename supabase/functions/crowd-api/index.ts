import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// In-memory state
let currentCount = 45;
const history: Array<{ count: number; density: string; timestamp: string }> = [];
const alerts: Array<{ id: string; message: string; severity: string; location: string; timestamp: string }> = [];
const MAX_HISTORY = 100;
const MAX_ALERTS = 50;

function classifyDensity(count: number): string {
  if (count < 30) return "Low";
  if (count <= 70) return "Medium";
  return "High";
}

function generateUpdate() {
  const delta = Math.floor(Math.random() * 19) - 8;
  currentCount = Math.max(5, Math.min(100, currentCount + delta));
  const density = classifyDensity(currentCount);
  const timestamp = new Date().toISOString();

  history.push({ count: currentCount, density, timestamp });
  if (history.length > MAX_HISTORY) history.shift();

  const locations = ["Main Entrance", "Hall A", "Zone C", "Exit B", "Zone B", "Corridor 2"];
  const loc = locations[Math.floor(Math.random() * locations.length)];

  if (density === "High") {
    alerts.unshift({ id: crypto.randomUUID().slice(0, 8), message: "High crowd density detected", severity: "critical", location: loc, timestamp });
  } else if (density === "Medium" && Math.random() > 0.6) {
    alerts.unshift({ id: crypto.randomUUID().slice(0, 8), message: "Potential congestion risk", severity: "warning", location: loc, timestamp });
  }
  if (alerts.length > MAX_ALERTS) alerts.pop();

  // Prediction
  const recent = history.slice(-4).map(h => h.count);
  let trend = "Stable";
  let predicted = currentCount;
  if (recent.length >= 4) {
    const diffs = recent.slice(1).map((v, i) => v - recent[i]);
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    if (avg > 2) { trend = "Increasing"; predicted = Math.min(100, currentCount + Math.floor(Math.random() * 8 + 5)); }
    else if (avg < -2) { trend = "Decreasing"; predicted = Math.max(5, currentCount - Math.floor(Math.random() * 8 + 5)); }
  }

  return {
    count: currentCount,
    density,
    alerts: alerts.slice(0, 5),
    prediction: { trend, predicted_count: predicted, confidence: +(Math.random() * 0.3 + 0.65).toFixed(2) },
    history: history.slice(-20),
    timestamp,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    let body: unknown;

    switch (path) {
      case 'health':
        body = { status: "operational", simulation_mode: true };
        break;
      case 'current-count':
        generateUpdate();
        body = { count: currentCount, density: classifyDensity(currentCount), timestamp: new Date().toISOString() };
        break;
      case 'history':
        body = { data: history };
        break;
      case 'alerts':
        body = { alerts: alerts.slice(0, 20), total: alerts.length };
        break;
      case 'live-update':
        body = generateUpdate();
        break;
      default:
        body = { error: "Unknown endpoint. Use: health, current-count, history, alerts, live-update" };
    }

    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
