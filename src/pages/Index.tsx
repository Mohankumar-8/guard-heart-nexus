import TopNavbar from "@/components/TopNavbar";
import AppSidebar from "@/components/AppSidebar";
import DashboardContent from "@/components/DashboardContent";
import { SimulationProvider } from "@/context/SimulationContext";

const Index = () => {
  return (
    <SimulationProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <TopNavbar />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <DashboardContent />
          </main>
        </div>
      </div>
    </SimulationProvider>
  );
};

export default Index;
