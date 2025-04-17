
import ShiftForm from "@/components/ShiftForm";
import Dashboard from "@/components/Dashboard";
import { MainSidebar } from "@/components/MainSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gray-900 text-gray-100">
        <MainSidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-8">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Sistema de Ponto - Administração
              </h1>
            </div>
            <div className="mb-12">
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
