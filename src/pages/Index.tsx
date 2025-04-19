
import ShiftForm from "@/components/ShiftForm";
import Dashboard from "@/components/Dashboard";
import { MainSidebar } from "@/components/MainSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gray-900 text-gray-100">
        <MainSidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-4 md:py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
              <div className="flex items-center">
                <SidebarTrigger className="mr-4" />
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  Sistema de Ponto
                </h1>
              </div>
              <div className="text-sm text-gray-400">
                Servidor 10
              </div>
            </div>
            <div className="mb-8 md:mb-12">
              <ShiftForm />
            </div>
            <Dashboard />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
