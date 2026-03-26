import TopNavbar from "@/components/TopNavbar";
import AppSidebar from "@/components/AppSidebar";
import DashboardContent from "@/components/DashboardContent";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { SimulationProvider, useSimulation } from "@/context/SimulationContext";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const DashboardShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading: contextLoading } = useSimulation();
  const [uiReady, setUiReady] = useState(false);

  useEffect(() => {
    // Show skeleton for at least 1s, or until data is ready
    const timer = setTimeout(() => setUiReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const showSkeleton = !uiReady || contextLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNavbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {showSkeleton ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardSkeleton />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <DashboardContent />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <SimulationProvider>
      <DashboardShell />
    </SimulationProvider>
  );
};

export default Index;
