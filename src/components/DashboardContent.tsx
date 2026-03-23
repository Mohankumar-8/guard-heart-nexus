import { Users, Camera, AlertTriangle, Activity, Eye, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import LiveCameraFeed from "@/components/LiveCameraFeed";
import CrowdTrendChart from "@/components/CrowdTrendChart";
import CrowdStatsCards from "@/components/CrowdStatsCards";
import StatCard from "@/components/StatCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const crowdData = [
  { time: "06:00", count: 120 },
  { time: "08:00", count: 450 },
  { time: "10:00", count: 820 },
  { time: "12:00", count: 1100 },
  { time: "14:00", count: 950 },
  { time: "16:00", count: 1300 },
  { time: "18:00", count: 1580 },
  { time: "20:00", count: 890 },
  { time: "22:00", count: 340 },
];

const zoneData = [
  { zone: "Zone A", density: 85 },
  { zone: "Zone B", density: 62 },
  { zone: "Zone C", density: 94 },
  { zone: "Zone D", density: 41 },
  { zone: "Zone E", density: 73 },
];

const alerts = [
  { id: 1, type: "High Density", location: "Main Entrance", time: "2 min ago", severity: "high" },
  { id: 2, type: "Unusual Movement", location: "Zone C - North", time: "8 min ago", severity: "medium" },
  { id: 3, type: "Capacity Warning", location: "Hall B", time: "15 min ago", severity: "high" },
  { id: 4, type: "Perimeter Breach", location: "Gate 4", time: "22 min ago", severity: "low" },
];

const cameras = [
  { id: 1, name: "CAM-01 Main Gate", status: "active", people: 142 },
  { id: 2, name: "CAM-02 Hall A", status: "active", people: 89 },
  { id: 3, name: "CAM-03 Parking", status: "active", people: 34 },
  { id: 4, name: "CAM-04 Exit B", status: "offline", people: 0 },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const DashboardContent = () => {
  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
      >
        {[
          { title: "Total People", value: "4,832", change: "+12% from yesterday", changeType: "positive" as const, icon: <Users className="h-5 w-5" /> },
          { title: "Active Cameras", value: "24/28", change: "4 offline", changeType: "negative" as const, icon: <Camera className="h-5 w-5" /> },
          { title: "Active Alerts", value: "7", change: "3 critical", changeType: "negative" as const, icon: <AlertTriangle className="h-5 w-5" /> },
          { title: "Avg. Density", value: "72%", change: "+5% this hour", changeType: "neutral" as const, icon: <Activity className="h-5 w-5" /> },
        ].map((stat) => (
          <motion.div key={stat.title} variants={fadeUp}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Crowd Stats */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <CrowdStatsCards />
      </motion.div>

      {/* Live Camera Feed */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <LiveCameraFeed />
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <motion.div
          className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Crowd Flow — Today
            </h2>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={crowdData}>
              <defs>
                <linearGradient id="crowdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(168, 80%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(168, 80%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'hsl(215, 12%, 50%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 12%, 50%)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(220, 18%, 10%)', border: '1px solid hsl(220, 14%, 16%)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: 'hsl(210, 20%, 92%)' }}
              />
              <Area type="monotone" dataKey="count" stroke="hsl(168, 80%, 50%)" fill="url(#crowdGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar chart */}
        <motion.div
          className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-display font-semibold text-foreground mb-4">Zone Density</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={zoneData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(215, 12%, 50%)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="zone" tick={{ fontSize: 11, fill: 'hsl(215, 12%, 50%)' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(220, 18%, 10%)', border: '1px solid hsl(220, 14%, 16%)', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="density" fill="hsl(168, 80%, 50%)" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts */}
        <motion.div
          className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Recent Alerts
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${
                    alert.severity === "high" ? "bg-destructive" : alert.severity === "medium" ? "bg-warning" : "bg-success"
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{alert.type}</p>
                    <p className="text-xs text-muted-foreground">{alert.location}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{alert.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cameras */}
        <motion.div
          className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Camera Feeds
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {cameras.map((cam) => (
              <div key={cam.id} className="bg-secondary rounded-lg p-3 border border-border">
                <div className="aspect-video bg-muted rounded-md mb-2 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-foreground truncate">{cam.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    cam.status === "active" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                  }`}>
                    {cam.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{cam.people} people</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardContent;
