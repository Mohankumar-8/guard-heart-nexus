/**
 * CrowdGuard AI — API Service
 * Connects to Lovable Cloud edge functions OR falls back to simulation.
 */
import { supabase } from "@/integrations/supabase/client";

export interface CrowdDataResponse {
  count: number;
  density: "Low" | "Medium" | "High";
  timestamp: string;
}

export interface AlertResponse {
  id: string;
  message: string;
  severity: "safe" | "warning" | "critical";
  location: string;
  timestamp: string;
}

export interface PredictionResponse {
  trend: "Increasing" | "Stable" | "Decreasing";
  predicted_count: number;
  confidence: number;
}

export interface LiveUpdateResponse {
  count: number;
  density: string;
  alerts: AlertResponse[];
  prediction: PredictionResponse;
  history: CrowdDataResponse[];
  timestamp: string;
}

/**
 * Fetch current crowd count from edge function.
 */
export async function fetchCrowdData(): Promise<CrowdDataResponse | null> {
  try {
    const { data, error } = await supabase.functions.invoke("crowd-api/current-count");
    if (error) throw error;
    return data as CrowdDataResponse;
  } catch (err) {
    console.warn("Cloud API unavailable, using simulation:", err);
    return null;
  }
}

/**
 * Fetch alerts from edge function.
 */
export async function fetchAlerts(): Promise<AlertResponse[]> {
  try {
    const { data, error } = await supabase.functions.invoke("crowd-api/alerts");
    if (error) throw error;
    return (data as { alerts: AlertResponse[] }).alerts;
  } catch (err) {
    console.warn("Cloud API unavailable, using simulation:", err);
    return [];
  }
}

/**
 * Fetch a full live update (crowd + alerts + prediction).
 */
export async function fetchLiveUpdate(): Promise<LiveUpdateResponse | null> {
  try {
    const { data, error } = await supabase.functions.invoke("crowd-api/live-update");
    if (error) throw error;
    return data as LiveUpdateResponse;
  } catch (err) {
    console.warn("Cloud API unavailable, using simulation:", err);
    return null;
  }
}

/**
 * Health check.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke("crowd-api/health");
    if (error) throw error;
    return data?.status === "operational";
  } catch {
    return false;
  }
}

/**
 * Check if Lovable Cloud backend is reachable.
 */
export function isBackendConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL);
}
