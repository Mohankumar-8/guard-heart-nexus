import TopNavbar from "@/components/TopNavbar";
import AppSidebar from "@/components/AppSidebar";
import DashboardContent from "@/components/DashboardContent";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { SimulationProvider } from "@/context/SimulationContext";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SimulationProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <TopNavbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              {loading ? (
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
    </SimulationProvider>
  );
};

export default Index;
