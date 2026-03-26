import { Users, Camera, AlertTriangle, Activity, Eye, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import CrowdStatsCards from "@/components/CrowdStatsCards";
import AlertsPanel from "@/components/AlertsPanel";
import CrowdPredictionCard from "@/components/CrowdPredictionCard";
import StatCard from "@/components/StatCard";

const LiveCameraFeed = lazy(() => import("@/components/LiveCameraFeed"));
const CrowdTrendChart = lazy(() => import("@/components/CrowdTrendChart"));
const LazyCharts = lazy(() => import("@/components/DashboardCharts"));

const ChartFallback = () => (
  <div className="bg-card rounded-xl border border-border p-5 h-[280px] animate-pulse" />
);

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const DashboardContent = () => {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto h-full">
      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
      >
        {[
          { title: "Total People", value: "4,832", change: "+12% from yesterday", changeType: "positive" as const, icon: <Users className="h-4 w-4 md:h-5 md:w-5" /> },
          { title: "Active Cameras", value: "24/28", change: "4 offline", changeType: "negative" as const, icon: <Camera className="h-4 w-4 md:h-5 md:w-5" /> },
          { title: "Active Alerts", value: "7", change: "3 critical", changeType: "negative" as const, icon: <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" /> },
          { title: "Avg. Density", value: "72%", change: "+5% this hour", changeType: "neutral" as const, icon: <Activity className="h-4 w-4 md:h-5 md:w-5" /> },
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

      {/* Live Camera Feed + Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Suspense fallback={<ChartFallback />}>
            <LiveCameraFeed />
          </Suspense>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <CrowdPredictionCard />
        </motion.div>
      </div>

      {/* Crowd Trend Chart */}
      <Suspense fallback={<ChartFallback />}>
        <CrowdTrendChart />
      </Suspense>

      {/* Alerts Panel */}
      <AlertsPanel />

      {/* Charts */}
      <Suspense fallback={<ChartFallback />}>
        <LazyCharts />
      </Suspense>
    </div>
  );
};

export default DashboardContent;
