
import ShiftForm from "@/components/ShiftForm";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Sistema de Ponto - Administração
          </h1>
          <ShiftForm />
        </div>
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
