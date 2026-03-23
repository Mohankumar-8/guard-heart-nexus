import { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Severity = "safe" | "warning" | "critical";

interface Alert {
  id: number;
  message: string;
  severity: Severity;
  location: string;
  timestamp: Date;
}

const alertTemplates: { message: string; severity: Severity; locations: string[] }[] = [
  { message: "High crowd density detected", severity: "critical", locations: ["Main Entrance", "Hall B", "Zone C North", "Gate 2"] },
  { message: "Potential congestion risk", severity: "warning", locations: ["Corridor A", "Exit 3", "Parking Lot", "Zone D"] },
  { message: "Safe — Normal activity", severity: "safe", locations: ["Zone A", "Hall C", "Gate 1", "Zone E South"] },
];

const severityConfig: Record<Severity, { dot: string; bg: string; border: string; text: string; icon: typeof AlertTriangle }> = {
  critical: { dot: "bg-destructive", bg: "bg-destructive/10", border: "border-destructive/20", text: "text-destructive", icon: AlertTriangle },
  warning: { dot: "bg-warning", bg: "bg-warning/10", border: "border-warning/20", text: "text-warning", icon: AlertCircle },
  safe: { dot: "bg-success", bg: "bg-success/10", border: "border-success/20", text: "text-success", icon: ShieldCheck },
};

let nextId = 1;

function generateAlert(): Alert {
  const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
  const location = template.locations[Math.floor(Math.random() * template.locations.length)];
  return {
    id: nextId++,
    message: template.message,
    severity: template.severity,
    location,
    timestamp: new Date(),
  };
}

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>(() =>
    Array.from({ length: 5 }, () => {
      const a = generateAlert();
      a.timestamp = new Date(Date.now() - Math.random() * 600_000);
      return a;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  );

  useEffect(() => {
    const id = setInterval(() => {
      setAlerts((prev) => [generateAlert(), ...prev].slice(0, 12));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const ago = (d: Date) => {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ago`;
  };

  return (
    <motion.div
      className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Alerts Panel
        </h2>
        <span className="text-[11px] text-muted-foreground">
          {alerts.length} total
        </span>
      </div>

      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => {
            const cfg = severityConfig[alert.severity];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.border} ${cfg.bg}`}
              >
                <div className={`mt-0.5 p-1.5 rounded-md ${cfg.bg} ${cfg.text}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${cfg.text}`}>{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.location}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-mono text-muted-foreground">{formatTime(alert.timestamp)}</p>
                  <p className="text-[10px] text-muted-foreground">{ago(alert.timestamp)}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AlertsPanel;
