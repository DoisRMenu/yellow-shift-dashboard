
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuthContextType = {
  isAuthenticated: boolean;
  isDeveloper: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session);
      setIsAuthenticated(!!session);
      if (session?.user) {
        checkUserRole(session.user.id);
      } else {
        setIsDeveloper(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", !!session);
      setIsAuthenticated(!!session);
      if (session?.user) {
        checkUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_credentials')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking user role:', error);
        return;
      }

      console.log("User role data:", data);
      setIsDeveloper(data?.role === 'developer');
    } catch (error) {
      console.error('Exception checking user role:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log(`Attempting login with email: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error logging in:', error);
        toast.error('Erro ao fazer login. Verifique suas credenciais.');
        throw error;
      }
      
      if (data?.user) {
        console.log('Login successful:', data.user);
        toast.success('Login realizado com sucesso!');
      } else {
        // This should not happen, but just in case
        console.error('Login failed: No user data returned');
        toast.error('Erro ao fazer login. Verifique suas credenciais.');
        throw new Error('Login failed: No user data returned');
      }
    } catch (error) {
      console.error('Exception during login:', error);
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
