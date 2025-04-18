
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ShiftForm from "@/components/ShiftForm";
import Dashboard from "@/components/Dashboard";
import { MainSidebar } from "@/components/MainSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Login from "@/components/Login";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-gray-100 p-4">
        <Login />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gray-900 text-gray-100">
        <MainSidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <SidebarTrigger className="mr-4" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  Sistema de Ponto - Administração
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400">
                  Servidor 10
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => supabase.auth.signOut()}
                >
                  Sair
                </Button>
              </div>
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
