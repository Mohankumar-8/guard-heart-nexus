import { motion } from "framer-motion";

const ShimmerBlock = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden rounded-xl bg-card border border-border ${className}`}>
    <div className="absolute inset-0 shimmer-gradient" />
  </div>
);

const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 h-full animate-fade-in">
    {/* Top stats row */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <ShimmerBlock key={i} className="h-[100px]" />
      ))}
    </div>

    {/* Crowd stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <ShimmerBlock className="h-[130px]" />
      <ShimmerBlock className="h-[130px]" />
    </div>

    {/* Camera + Prediction */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <ShimmerBlock className="lg:col-span-2 h-[300px]" />
      <ShimmerBlock className="h-[300px]" />
    </div>

    {/* Chart */}
    <ShimmerBlock className="h-[260px]" />

    {/* Alerts */}
    <ShimmerBlock className="h-[200px]" />
  </div>
);

export default DashboardSkeleton;
