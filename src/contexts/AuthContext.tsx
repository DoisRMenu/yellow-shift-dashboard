
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuthContextType = {
  isAuthenticated: boolean;
  isDeveloper: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        checkUserRole(session.user.id);
      } else {
        setIsDeveloper(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        checkUserRole(session.user.id);
      }
    });
  }, []);

  const checkUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_credentials')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    setIsDeveloper(data?.role === 'developer');
  };

  const login = async (username: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: `${username}@admin.com`,
        password,
      });

      if (error) throw error;
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Erro ao fazer logout.');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isDeveloper, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
